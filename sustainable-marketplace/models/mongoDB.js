require("dotenv").config();
const mongoose = require("mongoose");

if (!process.env.MONGO_URL) {
  throw new Error("❌ MONGO_URL is missing! Check your .env file.");
}

mongoose
  .connect(process.env.MONGO_URL) // Removed deprecated options
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

module.exports = mongoose;
