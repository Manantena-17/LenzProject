
const eventService = require('../services/event.service');
const AppError = require('../utils/AppError');

exports.createEvent = async (req, res, next) => {
  try {
    console.log("📥 Données reçues (body) :", req.body);
    console.log("📁 Fichier reçu (file) :", req.file);
    console.log("👤 Utilisateur connecté :", req.user || req.userId);

    const body = { ...req.body };
    const loggedInUserId = req.user ? req.user.id : req.userId;

    if (!loggedInUserId) {
      throw new AppError("Action non autorisée. Vous devez être connecté pour créer un événement.", 401);
    }

    body.organizerId = loggedInUserId;
    body.userId = loggedInUserId;

    if (!body.date) {
      body.date = body.openedAt || new Date().toISOString();
    }

    if (req.file) {
      body.thumbnail = `/uploads/events/${req.file.filename}`;
    }

    if (typeof body.photographerIds === 'string') {
      try {
        body.photographerIds = JSON.parse(body.photographerIds);
      } catch (e) {
        body.photographerIds = [];
      }
    }

    const newEvent = await eventService.createAdvancedEvent(body);

    res.status(201).json({
      success: true,
      message: "L'événement et ses règles de gestion ont été créés !",
      data: newEvent
    });
  } catch (error) {
    console.error("❌ ERREUR DETAILLEE DANS CREATEEVENT :", error);
    next(error);
  }
};

exports.addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : req.userId;

    if (!userId) {
      throw new AppError('Vous devez être connecté pour ajouter une photo.', 401);
    }

    let imageUrl = req.body.url;
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }
    if (!imageUrl) {
      throw new AppError("Veuillez fournir une image (fichier ou URL valide).", 400);
    }

    const newImage = await eventService.addImageToEvent(id, imageUrl, userId);

    res.status(201).json({
      success: true,
      message: "Image ajoutée à la galerie avec succès !",
      data: newImage
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    
    const sortedEvents = Array.isArray(events) 
      ? [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : events;

    res.status(200).json({
      success: true,
      data: sortedEvents
    });
  } catch (error) {
    next(error);
  }
};

exports.voteImage = async (req, res, next) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const { imageId } = req.params;

    const rawStars = req.body.stars !== undefined ? req.body.stars : req.body.rating;
    const stars = parseInt(rawStars, 10);

    if (isNaN(stars) || stars < 1 || stars > 5) {
      throw new AppError('Le vote doit être un nombre entier entre 1 et 5', 400);
    }

    const userId = req.user ? req.user.id : req.userId;
    if (!userId) {
      throw new AppError('Vous devez être connecté pour voter', 401);
    }

    const updatedImage = await eventService.voteForImage(eventId, imageId, userId, stars);

    return res.status(200).json({
      success: true,
      message: 'Vote enregistré avec succès !',
      data: updatedImage
    });
  } catch (err) {
    next(err);
  }
};

exports.getWinner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await eventService.getEventWithWinningImage(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user ? req.user.id : req.userId;

    if (!loggedInUserId) {
      throw new AppError("Action non autorisée. Vous devez être connecté.", 401);
    }

    await eventService.deleteEvent(id, loggedInUserId);

    res.status(200).json({
      success: true,
      message: "L'événement a été supprimé avec succès."
    });
  } catch (error) {
    next(error);
  }
};