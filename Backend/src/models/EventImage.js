
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { Event } = require('./Event');
const { User } = require('./User');

const EventImage = sequelize.define('EventImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  url: { type: DataTypes.STRING, allowNull: false },
  votes: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }
}, {
  tableName: 'event_images',
  timestamps: true
});

Event.hasMany(EventImage, { 
  foreignKey: 'eventId', 
  as: 'images',         
  onDelete: 'CASCADE'   
});


EventImage.belongsTo(Event, { 
  foreignKey: 'eventId', 
  as: 'event' 
});
Event.belongsToMany(User, 
  { through: 'EventPhotographers'
    , as: 'photographers'
    , foreignKey: 'eventId' 
  });
User.belongsToMany(Event, 
  { through: 'EventPhotographers', 
    as: 'officialEvents', 
    foreignKey: 'userId' 
  });
module.exports = { EventImage };