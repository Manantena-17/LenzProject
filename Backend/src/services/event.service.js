
const { Event, EventImage, User, Vote, sequelize } = require('../models');
const AppError = require('../utils/AppError');

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

  if (photographerIds && photographerIds.length > 0 && typeof newEvent.setPhotographers === 'function') {
    await newEvent.setPhotographers(photographerIds);
  }

  return await Event.findByPk(newEvent.id, {
    include: [{ model: User, as: 'photographers', attributes: ['id', 'name', 'email'] }]
  });
};

exports.addImageToEvent = async (eventId, imageUrl) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return await EventImage.create({ url: imageUrl, eventId, votes: 0 });
};


exports.getEventById = async (id) => {
  const event = await Event.findByPk(id, {
    include: [
      {
        model: EventImage,
        as: 'images',
        attributes: ['id', 'url', 'votes', 'ratingSum']
      }
    ]
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};


exports.voteForImage = async (eventId, imageId, userId, stars) => {

  const image = await EventImage.findOne({
    where: { id: imageId, eventId: eventId }
  });

  if (!image) {
    throw new AppError("Image introuvable pour cet événement", 404);
  }

  const numericStars = parseInt(stars, 10);

  await Vote.upsert({
    eventId,
    imageId,
    userId,
    stars: numericStars
  });

  const totalVotesCount = await Vote.count({ where: { imageId } });
  const totalStarsSum = await Vote.sum('stars', { where: { imageId } });
  await image.update({
    votes: totalVotesCount,
    ratingSum: totalStarsSum || 0
  });

  return image;
};


exports.getEventWithWinningImage = async (eventId) => {
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: EventImage,
        as: 'images',
        attributes: ['id', 'url', 'votes', 'ratingSum'],
        limit: 1,
        order: [['votes', 'DESC']]
      }
    ]
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};


exports.getAllEvents = async () => {
  try {
    return await Event.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: EventImage,
          as: 'images',
          required: false
        }
      ]
    });
  } catch (error) {
    console.error("Erreur Sequelize dans getAllEvents :", error);
    throw error;
  }
};


exports.deleteEvent = async (eventId, userId) => {
  const event = await Event.findByPk(eventId);

  if (!event) {
    throw new AppError("Événement introuvable.", 404);
  }

  if (event.organizerId && String(event.organizerId) !== String(userId)) {
    throw new AppError("Vous n'avez pas la permission de supprimer cet événement.", 403);
  }

  await event.destroy();
  return true;
};