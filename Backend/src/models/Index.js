
const { sequelize } = require('../config/db');
const Event = require('./Event');
const EventImage = require('./EventImage');
const User = require('./User');
const Vote = require('./Vote');

Event.hasMany(EventImage, {
  foreignKey: 'eventId',
  as: 'images',
  onDelete: 'CASCADE'
});

EventImage.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

Event.belongsToMany(User, {
  through: 'EventPhotographers',
  as: 'photographers',
  foreignKey: 'eventId'
});

User.belongsToMany(Event, {
  through: 'EventPhotographers',
  as: 'officialEvents',
  foreignKey: 'userId'
});
Vote.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Vote, { foreignKey: 'userId' });

Vote.belongsTo(EventImage, { foreignKey: 'imageId', as: 'image' });
EventImage.hasMany(Vote, { foreignKey: 'imageId', as: 'votesList' });

Vote.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Vote, { foreignKey: 'eventId' });

module.exports = {
  sequelize,
  Event,
  EventImage,
  User,
  Vote
};