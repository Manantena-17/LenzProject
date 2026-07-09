
const { EventImage } = require('../models/EventImage')
const { Event } = require('../models/Event')
const AppError = require('../utils/AppError')
 // create event with out image
exports.createEvent = async (eventData) => {
  const { title, description, date, thumbnail } = eventData;
  return await Event.create({ title, description, date, thumbnail });
};

// add image at event
exports.addImageToEvent = async (eventId, imageUrl) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError('Événement introuvable', 404);
  }
  return await EventImage.create({ url: imageUrl, eventId });
};

// get event
exports.getEventById = async (id) => {
  const event = await Event.findByPk(id, {
    include: [
      {
        model: EventImage,
        as: 'images',
        attributes: ['id', 'url'] // Propre et performant !
      }
    ]
  });

  if (!event) {
    throw new AppError('Événement introuvable', 404);
  }

  return event;
};
// vote image
exports.voteForImage = async (imageId) => {
  const image = await EventImage.findByPk(imageId);
  if (!image) {
    throw new AppError('Image introuvable', 404);
  }
  return await image.increment('votes', { by: 1 });
};

exports.getEventWithWinningImage = async (eventId) => {
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: EventImage,
        as: 'images',
        attributes: ['id', 'url', 'votes'],
        limit: 1, 
        order: [['votes', 'DESC']]
      }
    ]
  });

  if (!event) {
    throw new AppError('Événement introuvable', 404);
  }

  return event;
};

 // get image all one event
exports.getAllEvents = async () => {
  return await Event.findAll({
    include: [
      {
        model: EventImage,
        as: 'images',
        attributes: ['id', 'url']
      }
    ]
  });
};