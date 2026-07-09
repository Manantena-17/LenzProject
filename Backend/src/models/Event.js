// src/models/Event.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: true },
  thumbnail: { type: DataTypes.STRING, allowNull: true } // L'image principale du feed
}, {
  tableName: 'events',
  timestamps: true
});

module.exports = { Event };