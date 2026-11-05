import request from "supertest";
import app from "../../src/app.js";
import { Product } from "../../src/models/product.model.js";
import { Bid } from "../../src/models/bid.model.js";
import { Notification } from "../../src/models/notification.model.js";
import { placeBid, closeExpiredAuctions } from "../../src/modules/bid/bid.service.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const auction = (sellerId, extra = {}) => makeProduct(sellerId, { biddingEnabled: true, biddingStartingPrice: 100, ...extra });
const tryBid = (productId, userId, amount) => placeBid({ productId, userId, amount }).then(() => "ok").catch((e) => e.status);

describe("FR-4.3 Bid integrity", () => {
    it("accepts exactly one of 10 simultaneous equal bids", async () => {
        const seller = await makeUser("seller");
        const p = await auction(seller.user._id);
        const bidders = await Promise.all(Array.from({ length: 10 }, () => makeUser("buyer")));
        const results = await Promise.all(bidders.map((b) => tryBid(p._id, b.user._id, 150)));
        expect(results.filter((r) => r === "ok")).toHaveLength(1);
        expect(results.filter((r) => r === 409)).toHaveLength(9);
        expect(await Bid.countDocuments()).toBe(1);
    });

    it("ends with the highest of many simultaneous rising bids", async () => {
        const seller = await makeUser("seller");
        const p = await auction(seller.user._id);
        const b = await makeUser("buyer");
        await Promise.all(Array.from({ length: 10 }, (_, i) => tryBid(p._id, b.user._id, 160 + i * 10)));
        expect((await Product.findById(p._id)).currentBid).toBe(250);
    });

    it("rejects a bid equal to the current highest bid", async () => {
        const seller = await makeUser("seller");
        const p = await auction(seller.user._id);
        const b = await makeUser("buyer");
        expect(await tryBid(p._id, b.user._id, 200)).toBe("ok");
        expect(await tryBid(p._id, b.user._id, 200)).toBe(409);
    });

    it.each([
        ["below the starting price", {}, 90, 400],
        ["bidding not enabled", { biddingEnabled: false }, 999, 400],
        ["auction already ended", { biddingEndTime: new Date(Date.now() - 1000) }, 999, 400],
        ["product not approved", { isApproved: false }, 999, 404],
        ["invalid amount", {}, "abc", 400],
    ])("rejects a bid when %s", async (_, extra, amount, status) => {
        const seller = await makeUser("seller");
        const p = await auction(seller.user._id, extra);
        expect(await tryBid(p._id, seller.user._id, amount)).toBe(status);
    });

    it("places a bid over REST and returns 401 without login", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await auction(seller.user._id);
        expect((await request(app).post("/api/bids").send({ productId: p._id, amount: 150 })).status).toBe(401);
        expect((await request(app).post("/api/bids").set(buyer.auth).send({ productId: p._id, amount: 150 })).status).toBe(201);
        const top = await request(app).get(`/api/bids/${p._id}`);
        expect(top.body.data.amount).toBe(150);
    });

    it("notifies the previous leader that they were outbid", async () => {
        const seller = await makeUser("seller");
        const [a, b] = [await makeUser("buyer"), await makeUser("buyer")];
        const p = await auction(seller.user._id);
        await placeBid({ productId: p._id, userId: a.user._id, amount: 150 });
        await placeBid({ productId: p._id, userId: b.user._id, amount: 200 });
        await new Promise((r) => setTimeout(r, 200)); // outbid notice is fire-and-forget
        expect(await Notification.countDocuments({ userId: a.user._id, type: "bid" })).toBe(1);
        expect(await Notification.countDocuments({ userId: b.user._id })).toBe(0);
    });
});

describe("FR-4.4 Auction close", () => {
    it("closes an expired auction once and records the winner", async () => {
        const seller = await makeUser("seller");
        const winner = await makeUser("buyer");
        const p = await auction(seller.user._id, { biddingEndTime: new Date(Date.now() + 300) });
        await placeBid({ productId: p._id, userId: winner.user._id, amount: 300 });
        await new Promise((r) => setTimeout(r, 400));

        const runs = await Promise.all([closeExpiredAuctions(), closeExpiredAuctions(), closeExpiredAuctions()]);
        expect(runs.flat()).toHaveLength(1);
        const closed = await Product.findById(p._id);
        expect(closed.auctionClosed).toBe(true);
        expect(closed.auctionWinner.toString()).toBe(winner.user._id.toString());
        expect(await closeExpiredAuctions()).toHaveLength(0);
        expect(await tryBid(p._id, winner.user._id, 999)).toBe(400);
    });

    it("closes an auction with no bids without a winner", async () => {
        const seller = await makeUser("seller");
        await auction(seller.user._id, { biddingEndTime: new Date(Date.now() - 1000) });
        const [closed] = await closeExpiredAuctions();
        expect(closed.auctionWinner).toBeNull();
    });
});
