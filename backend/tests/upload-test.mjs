// Upload signature check. Part A: pure function. Part B: endpoint over HTTP.
// Run from backend/:  API=http://localhost:5055 node tests/upload-test.mjs
// For B3 start the server with fake keys: CLOUDINARY_CLOUD_NAME=demo CLOUDINARY_API_KEY=k CLOUDINARY_API_SECRET=s
import "dotenv/config";
import jwt from "jsonwebtoken";
import { signParams } from "../src/modules/upload/upload.service.js";

const check = (label, got, want) => console.log(`${got === want ? "PASS" : "FAIL"}  ${label} -> ${got} (want ${want})`);
const tok = (role) => jwt.sign({ id: "6555555555555555555555aa", role }, process.env.JWT_SECRET, { expiresIn: "5m" });
const post = async (token) => {
  const res = await fetch(`${process.env.API}/api/uploads/signature`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return { status: res.status, body: await res.json() };
};

// Example from Cloudinary's "Generating authentication signatures" docs
check("A1 signature matches Cloudinary docs example",
  signParams({ timestamp: 1315060510, public_id: "sample_image" }, "abcd"), "b4ad47fb4e25c7bf5f92a20089f9db59bc302313");
check("A2 param order does not matter",
  signParams({ public_id: "sample_image", timestamp: 1315060510 }, "abcd"), "b4ad47fb4e25c7bf5f92a20089f9db59bc302313");

if (process.env.API) {
  check("B1 no token -> 401", (await post()).status, 401);
  check("B2 buyer -> 403", (await post(tok("buyer"))).status, 403);
  const r = await post(tok("seller"));
  if (process.env.EXPECT_CONFIGURED) {
    check("B3 seller gets signature", r.status, 200);
    check("B4 folder is per-seller", r.body.data?.folder, "products/6555555555555555555555aa");
    check("B5 signature verifies with secret", r.body.data && signParams({ folder: r.body.data.folder, timestamp: r.body.data.timestamp }, "s"), r.body.data?.signature);
    check("B6 secret not leaked", JSON.stringify(r.body).includes('"s"') || "apiSecret" in (r.body.data || {}), false);
  } else {
    check("B3 not configured -> 503", r.status, 503);
  }
}
process.exit(0);
