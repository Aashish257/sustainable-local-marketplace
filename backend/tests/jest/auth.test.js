import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app.js";
import User from "../../src/models/user.model.js";
import { startDb, stopDb, clearDb, makeUser } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const valid = { name: "Asha", email: "asha@test.com", password: "secret123", role: "buyer", consent: true };

describe("FR-1.1 Registration", () => {
    it("registers a buyer with consent and stores consent time", async () => {
        const res = await request(app).post("/api/auth/register").send(valid);
        expect(res.status).toBe(201);
        const user = await User.findOne({ email: valid.email });
        expect(user.consentGiven).toBe(true);
        expect(user.consentAt).toBeInstanceOf(Date);
    });

    it("rejects registration without consent", async () => {
        const res = await request(app).post("/api/auth/register").send({ ...valid, consent: undefined });
        expect(res.status).toBe(400);
    });

    it("rejects self-registration as admin (privilege escalation)", async () => {
        const res = await request(app).post("/api/auth/register").send({ ...valid, role: "admin" });
        expect(res.status).toBe(400);
        expect(await User.countDocuments()).toBe(0);
    });

    it("ignores extra fields the client sends (no mass assignment)", async () => {
        await request(app).post("/api/auth/register").send({ ...valid, consentGiven: false, isAdmin: true });
        const user = await User.findOne({ email: valid.email }).lean();
        expect(user.consentGiven).toBe(true);
        expect(user.isAdmin).toBeUndefined();
    });

    it("rejects a duplicate email", async () => {
        await request(app).post("/api/auth/register").send(valid);
        const res = await request(app).post("/api/auth/register").send(valid);
        expect(res.status).toBe(400);
    });

    it("hashes passwords with BCRYPT_ROUNDS", async () => {
        await request(app).post("/api/auth/register").send(valid);
        const user = await User.findOne({ email: valid.email });
        expect(user.password).not.toBe(valid.password);
        expect(bcrypt.getRounds(user.password)).toBe(4);
    });
});

describe("FR-1.2 Login", () => {
    beforeEach(() => request(app).post("/api/auth/register").send(valid));

    it("returns a token for correct credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: valid.email, password: valid.password });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toEqual(expect.any(String));
    });

    it("rejects a wrong password", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: valid.email, password: "wrong" });
        expect(res.status).toBe(400);
    });
});

describe("FR-1.3 Protected routes", () => {
    it("returns 401 without a token", async () => {
        expect((await request(app).get("/api/auth/me")).status).toBe(401);
    });

    it("returns 401 for an invalid token", async () => {
        const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-jwt");
        expect(res.status).toBe(401);
    });

    it("returns the current user with a valid token", async () => {
        const { auth, user } = await makeUser("buyer");
        const res = await request(app).get("/api/auth/me").set(auth);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(user._id.toString());
    });

    it("returns 403 when the role is not allowed", async () => {
        const { auth } = await makeUser("buyer");
        expect((await request(app).get("/api/admin/stats").set(auth)).status).toBe(403);
    });
});
