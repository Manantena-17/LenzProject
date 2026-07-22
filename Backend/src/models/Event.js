
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: true },
  thumbnail: { type: DataTypes.STRING, allowNull: true },
  limitPerPerson: { type: DataTypes.INTEGER, defaultValue: 0 }, 
  limitContributors: { type: DataTypes.INTEGER, defaultValue: 0 },
  limitTotalImages: { type: DataTypes.INTEGER, defaultValue: 0 },
  openedAt: { type: DataTypes.DATE, allowNull: false },  
  closedAt: { type: DataTypes.DATE, allowNull: false },  
  votingEndsAt: { type: DataTypes.DATE, allowNull: false } 
}, {
  tableName: 'events',
  timestamps: true
});

module.exports = Event;