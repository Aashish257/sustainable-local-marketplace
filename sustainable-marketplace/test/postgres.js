require("dotenv").config(); // Ensure dotenv is loaded
const { Sequelize } = require("sequelize");

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing! Check your .env file.");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

module.exports = sequelize;
