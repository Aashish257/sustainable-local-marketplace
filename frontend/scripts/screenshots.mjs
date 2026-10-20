// UI review helper: captures key screens for buyer, seller and admin.
// Usage (API on :5000, Vite on :5173, seeded DB):  node scripts/screenshots.mjs <outDir>
import { chromium } from "@playwright/test";
import fs from "fs";

const OUT = process.argv[2] || "screenshots";
const WEB = "http://localhost:5173";
const API = "http://localhost:5000/api";
fs.mkdirSync(OUT, { recursive: true });

const login = async (email) => {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
    });
    const { data } = await res.json();
    return data; // { token, user }
};

const products = (await (await fetch(`${API}/products?limit=50`)).json()).data;
const auction = products.find((p) => p.biddingEnabled);
const normal = products.find((p) => !p.biddingEnabled);

const shots = [
    { name: "01-home", path: "/" },
    { name: "02-catalog", path: "/products" },
    { name: "03-product", path: `/products/${normal?._id}` },
    { name: "04-auction", path: `/products/${auction?._id}`, as: "buyer@sustain.com" },
    { name: "05-login", path: "/login" },
    { name: "06-register", path: "/register" },
    { name: "07-orders", path: "/orders", as: "buyer@sustain.com" },
    { name: "08-seller-dash", path: "/dashboard", as: "seller@sustain.com" },
    { name: "09-seller-products", path: "/dashboard/products", as: "seller@sustain.com" },
    { name: "10-admin-dash", path: "/admin", as: "admin@sustain.com" },
    { name: "11-admin-products", path: "/admin/products", as: "admin@sustain.com" },
    { name: "12-catalog-mobile", path: "/products", mobile: true },
    { name: "13-catalog-dark", path: "/products", dark: true },
    { name: "14-auctions", path: "/auctions" },
    { name: "15-seller-opens-marketplace", path: "/marketplace", as: "seller@sustain.com" },
    { name: "16-admin-views-product", path: `/products/${auction?._id}`, as: "admin@sustain.com" },
];

// PW_CHROMIUM lets you reuse an already-downloaded Chromium instead of "npx playwright install"
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
for (const s of shots) {
    const ctx = await browser.newContext({
        viewport: s.mobile ? { width: 390, height: 844 } : { width: 1366, height: 860 },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
    });
    const session = s.as ? await login(s.as) : null;
    await ctx.addInitScript(([session, dark]) => {
        localStorage.setItem("theme", dark ? "dark" : "light");
        if (session) {
            localStorage.setItem("auth-storage", JSON.stringify({
                state: { user: session.user, token: session.token, isAuthenticated: true }, version: 0,
            }));
        }
    }, [session, !!s.dark]);
    const page = await ctx.newPage();
    // "networkidle" never settles because of the live socket, so wait for content instead
    await page.goto(WEB + s.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000); // let lazy chunks and data load
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    await ctx.close();
    console.log("saved", s.name);
}
await browser.close();
