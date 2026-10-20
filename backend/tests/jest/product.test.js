import request from "supertest";
import app from "../../src/app.js";
import { Product } from "../../src/models/product.model.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const body = { title: "Bamboo Brush", description: "biodegradable bamboo toothbrush", price: 120, category: "home", stock: 10, sustainabilityScore: 8 };

describe("FR-2.1 Product creation", () => {
    it("lets a seller create a product that starts unapproved", async () => {
        const { auth } = await makeUser("seller");
        const res = await request(app).post("/api/products").set(auth).send(body);
        expect(res.status).toBe(201);
        expect(res.body.data.isApproved).toBe(false);
    });

    it("blocks buyers from creating products", async () => {
        const { auth } = await makeUser("buyer");
        expect((await request(app).post("/api/products").set(auth).send(body)).status).toBe(403);
    });

    it("rejects invalid input", async () => {
        const { auth } = await makeUser("seller");
        const res = await request(app).post("/api/products").set(auth).send({ ...body, price: -5 });
        expect(res.status).toBe(400);
    });

    it("stops a seller from editing another seller's product", async () => {
        const owner = await makeUser("seller");
        const other = await makeUser("seller");
        const p = await makeProduct(owner.user._id);
        const res = await request(app).put(`/api/products/${p._id}`).set(other.auth).send({ price: 1 });
        expect(res.status).toBe(403);
    });
});

describe("FR-2.2 Moderation", () => {
    it("hides pending products from the catalog and from strangers", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { isApproved: false });
        const list = await request(app).get("/api/products");
        expect(list.body.data).toHaveLength(0);
        expect((await request(app).get(`/api/products/${p._id}`)).status).toBe(404);
    });

    it("lets the owner open their pending product (edit page)", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { isApproved: false });
        expect((await request(app).get(`/api/products/${p._id}`).set(seller.auth)).status).toBe(200);
    });

    it("publishes a product after admin approval", async () => {
        const seller = await makeUser("seller");
        const admin = await makeUser("admin");
        const p = await makeProduct(seller.user._id, { isApproved: false });

        const queue = await request(app).get("/api/admin/products?status=pending").set(admin.auth);
        expect(queue.body.data.map((x) => x._id)).toContain(p._id.toString());

        expect((await request(app).patch(`/api/admin/products/${p._id}/approval`).set(admin.auth).send({ approved: "yes" })).status).toBe(400);
        expect((await request(app).patch(`/api/admin/products/${p._id}/approval`).set(admin.auth).send({ approved: true })).status).toBe(200);
        expect((await request(app).get(`/api/products/${p._id}`)).status).toBe(200);
    });

    it("blocks non-admins from approving", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { isApproved: false });
        const res = await request(app).patch(`/api/admin/products/${p._id}/approval`).set(seller.auth).send({ approved: true });
        expect(res.status).toBe(403);
    });
});

describe("FR-2.3 Catalog query", () => {
    beforeEach(async () => {
        const seller = await makeUser("seller");
        await makeProduct(seller.user._id, { title: "Cheap Soap", price: 50, category: "bath", sustainabilityScore: 9 });
        await makeProduct(seller.user._id, { title: "Mid Bottle", price: 300, category: "kitchen", sustainabilityScore: 6 });
        await makeProduct(seller.user._id, { title: "Pricey Lamp", price: 900, category: "home", sustainabilityScore: 4 });
        await makeProduct(seller.user._id, { title: "Hidden Mug", price: 10, isActive: false });
    });

    const titles = (res) => res.body.data.map((p) => p.title);

    it("filters by price range", async () => {
        expect(titles(await request(app).get("/api/products?minPrice=100&maxPrice=500"))).toEqual(["Mid Bottle"]);
    });

    it("filters by category and eco score", async () => {
        expect(titles(await request(app).get("/api/products?category=bath"))).toEqual(["Cheap Soap"]);
        expect(titles(await request(app).get("/api/products?minEcoScore=6")).sort()).toEqual(["Cheap Soap", "Mid Bottle"]);
    });

    it("searches text and sorts by price", async () => {
        expect(titles(await request(app).get("/api/products?search=lamp"))).toEqual(["Pricey Lamp"]);
        expect(titles(await request(app).get("/api/products?sort=price_asc"))).toEqual(["Cheap Soap", "Mid Bottle", "Pricey Lamp"]);
    });

    it("paginates and never shows inactive products", async () => {
        const res = await request(app).get("/api/products?limit=2&page=2");
        expect(res.body.data).toHaveLength(1);
        expect(await Product.countDocuments()).toBe(4);
    });
});

describe("FR-2.6 Marketplace vs Auctions sections", () => {
    beforeEach(async () => {
        const seller = await makeUser("seller");
        const id = seller.user._id;
        await makeProduct(id, { title: "Fixed Mug" });
        await makeProduct(id, { title: "Live Soon", biddingEnabled: true, biddingEndTime: new Date(Date.now() + 3_600_000) });
        await makeProduct(id, { title: "Live Later", biddingEnabled: true, biddingEndTime: new Date(Date.now() + 86_400_000) });
        await makeProduct(id, { title: "Ended One", biddingEnabled: true, biddingEndTime: new Date(Date.now() - 1000), auctionClosed: true });
    });
    const titles = (res) => res.body.data.map((p) => p.title);

    it("type=fixed returns only buy-now items", async () => {
        expect(titles(await request(app).get("/api/products?type=fixed"))).toEqual(["Fixed Mug"]);
    });

    it("live auctions are sorted by soonest ending and exclude ended ones", async () => {
        const res = await request(app).get("/api/products?type=auction&auction=live&sort=ending");
        expect(titles(res)).toEqual(["Live Soon", "Live Later"]);
    });

    it("ended auctions are listed separately", async () => {
        expect(titles(await request(app).get("/api/products?type=auction&auction=ended"))).toEqual(["Ended One"]);
    });

    it("search still works together with the auction filter", async () => {
        expect(titles(await request(app).get("/api/products?type=auction&auction=live&search=later"))).toEqual(["Live Later"]);
    });
});
