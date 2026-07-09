const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Vérifie le chemin vers ta config de BDD

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

module.exports = { User };