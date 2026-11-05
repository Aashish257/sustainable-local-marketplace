// Steps 8 + 9 check over real HTTP: product moderation and signup consent.
// Run from backend/ with the API running:  API=http://localhost:5000 node tests/step8-9-moderation-consent-test.mjs
// Creates temp users/product (emails start with "s89_") and deletes them after.
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { Product } from "../src/models/product.model.js";
import { hashPassword } from "../src/utils/hash.js";

const API = (process.env.API || "http://localhost:5000") + "/api";
const tag = Date.now();
const call = async (method, path, body, token) => {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const check = (label, got, want) => console.log(`${got === want ? "PASS" : "FAIL"}  ${label} -> ${got} (want ${want})`);
const user = (role, extra = {}) => ({ name: "S89 User", email: `s89_${role}_${tag}@test.com`, password: "secret123", role, ...extra });
const login = async (u) => {
  const r = await call("POST", "/auth/login", { email: u.email, password: u.password });
  return r.body.data?.token;
};

await mongoose.connect(process.env.MONGO_URI);
let productId;
try {
  // ---- Step 9: consent ----
  check("9a register without consent", (await call("POST", "/auth/register", user("buyer"))).status, 400);
  check("9b register with consent", (await call("POST", "/auth/register", user("buyer", { consent: true, consentGiven: false }))).status, 201);
  const saved = await User.findOne({ email: user("buyer").email });
  check("9c consentGiven stored (client cannot override)", saved?.consentGiven, true);
  check("9d consentAt stored", saved?.consentAt instanceof Date, true);

  // ---- Step 8: moderation ----
  const seller = user("seller", { consent: true });
  await call("POST", "/auth/register", seller);
  const admin = user("admin");
  await User.create({ name: "S89 Admin", email: admin.email, password: await hashPassword(admin.password), role: "admin" });
  const [sellerT, buyerT, adminT] = [await login(seller), await login(user("buyer")), await login(admin)];

  const title = `S89 Moderation Item ${tag}`;
  const created = await call("POST", "/products", {
    title, description: "temporary moderation test item", price: 99, category: "test", stock: 5, sustainabilityScore: 7,
    images: ["https://example.com/a.jpg"],
  }, sellerT);
  productId = created.body.data?._id;
  check("8a seller creates product", created.status, 201);
  check("8b new product starts unapproved", created.body.data?.isApproved, false);

  const inCatalog = async () => { const d = (await call("GET", `/products?search=${encodeURIComponent(title)}`)).body.data; return (Array.isArray(d) ? d : d?.products)?.length ?? -1; };
  check("8c pending product hidden from catalog", await inCatalog(), 0);
  check("8d guest opens pending product", (await call("GET", `/products/${productId}`)).status, 404);
  check("8e other buyer opens pending product", (await call("GET", `/products/${productId}`, null, buyerT)).status, 404);
  check("8f owner seller opens pending product (edit page)", (await call("GET", `/products/${productId}`, null, sellerT)).status, 200);
  const queue = await call("GET", "/admin/products?status=pending", null, adminT);
  check("8g admin pending queue contains it", queue.body.data?.some((p) => p._id === productId), true);
  check("8h buyer cannot approve", (await call("PATCH", `/admin/products/${productId}/approval`, { approved: true }, buyerT)).status, 403);
  check("8i bad body rejected", (await call("PATCH", `/admin/products/${productId}/approval`, { approved: "yes" }, adminT)).status, 400);
  check("8j admin approves", (await call("PATCH", `/admin/products/${productId}/approval`, { approved: true }, adminT)).status, 200);
  check("8k approved product in catalog", await inCatalog(), 1);
  check("8l guest opens approved product", (await call("GET", `/products/${productId}`)).status, 200);
  await call("PATCH", `/admin/products/${productId}/approval`, { approved: false }, adminT);
  check("8m rejected product hidden again", (await call("GET", `/products/${productId}`)).status, 404);
} finally {
  await User.deleteMany({ email: new RegExp(`^s89_.*_${tag}@test.com$`) });
  if (productId) await Product.deleteOne({ _id: productId });
  await mongoose.disconnect();
  process.exit(0);
}
