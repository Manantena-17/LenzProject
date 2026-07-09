const eventService = require('../services/event.service')

// create event
exports.createEvent = async (req, res, next) => {
  try {
    const newEvent = await eventService.createEvent(req.body);
    res.status(201).json({
      success: true,
      message: "Événement créé avec succès",
      data: newEvent
    });
  } catch (error) {
    next(error);
  }
};

// add image event exist
exports.addImage = async (req, res, next) => {
  try {
    const { id } = req.params; // L'ID de l'événement cible dans l'URL
    const { url } = req.body;  // L'URL de l'image secondaire dans le JSON
    
    const newImage = await eventService.addImageToEvent(id, url);
    res.status(201).json({
      success: true,
      message: "Image ajoutée à la galerie avec succès",
      data: newImage
    });
  } catch (error) {
    next(error);
  }
};

// get all event and all image
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};
//
// Action de voter pour une image
exports.voteImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    await eventService.voteForImage(imageId);
    
    res.status(200).json({
      success: true,
      message: "Vote enregistré avec succès !"
    });
  } catch (error) {
    next(error);
  }
};

// Afficher le résultat final (L'événement + son image gagnante)
exports.getWinner = async (req, res, next) => {
  try {
    const { id } = req.params; // ID de l'événement
    const result = await eventService.getEventWithWinningImage(id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// get event with all image
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