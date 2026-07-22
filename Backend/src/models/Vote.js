

const { DataTypes } = require('sequelize');
const dbConnection = require('../config/db');
const sequelize = dbConnection.sequelize || dbConnection;

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  imageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'event_images',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'votes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'imageId'],
      name: 'unique_user_image_vote'
    }
  ]
});

module.exports = Vote;