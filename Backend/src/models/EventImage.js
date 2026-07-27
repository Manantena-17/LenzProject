const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventImage = sequelize.define('EventImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
     type: DataTypes.INTEGER,
      allowNull: false 
    },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  ratingSum: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'event_images',
  timestamps: true
});

module.exports = EventImage;