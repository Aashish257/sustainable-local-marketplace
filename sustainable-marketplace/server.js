require("dotenv").config();
const express = require("express");
const sequelize = require("./models/postgres");
const mongoose = require("./models/mongoDB");

const app = express();

// Check PostgreSQL connection
app.get("/test/postgres", async (req, res) => {
  try {
    console.log("Attempting to connect to PostgreSQL...");
    await sequelize.authenticate();
    console.log("PostgreSQL connection established!");
    res.send("✅ PostgreSQL is connected successfully!");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    res.status(500).send("❌ PostgreSQL connection failed: " + err.message);
  }
});

// Check MongoDB connection
app.get("/test/mongo", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.send("✅ MongoDB is connected successfully!");
    } else {
      throw new Error("MongoDB is not connected.");
    }
  } catch (err) {
    res.status(500).send("❌ MongoDB connection failed: " + err.message);
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
