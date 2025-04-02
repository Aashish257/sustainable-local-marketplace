const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./postgres");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "completed", "canceled"), defaultValue: "pending" },
}, { timestamps: true });

module.exports = Order;
