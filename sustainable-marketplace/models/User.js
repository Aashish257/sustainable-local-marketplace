const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./postgres");

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("farmer", "buyer", "admin", "delivery_agent"), allowNull: false },
}, { timestamps: true });

module.exports = User;
