
const { EventImage } = require('../models/EventImage')
const { Event } = require('../models/Event')
const {User}=require('../models/User')
const AppError = require('../utils/AppError')
 // create event with out image
exports.createAdvancedEvent = async (eventData) => {
  const { 
    title, description, date, thumbnail,
    limitPerPerson, limitContributors, limitTotalImages,
    openedAt, closedAt, votingEndsAt,
    photographerIds 
  } = eventData;

  
  const newEvent = await Event.create({
    title, description, date, thumbnail,
    limitPerPerson, limitContributors, limitTotalImages,
    openedAt, closedAt, votingEndsAt
  });

  if (photographerIds && photographerIds.length > 0) {
    await newEvent.setPhotographers(photographerIds);
  }
  return await Event.findByPk(newEvent.id, {
    include: [{ model: User, as: 'photographers', attributes: ['id', 'name', 'email'] }]
  });
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
        attributes: ['id', 'url','votes'] 
      }
    ]
  });

  if (!event) {
    throw new AppError('Événement introuvable', 404);
  }

  return event;
};
// vote image
exports.voteForImage = async (eventId, imageId) => {
  const image = await EventImage.findOne({
    where: { id: imageId, eventId: eventId }
  });

  if (!image) {
    throw new AppError("Cette image n'existe pas ou n'appartient pas à cet événement", 404);
  }
  return await image.increment('votes', { by: 1 });
};
//

// get image winner
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