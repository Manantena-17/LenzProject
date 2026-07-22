const { EventImage } = require('../models/EventImage'); 
const { Event } = require('../models/Event');
// Importez votre modèle de Vote si vous enregistrez chaque vote individuellement
// const { Vote } = require('../models/Vote'); 

/**
 * Ajout d'une image à un événement
 */
exports.addImageToEvent = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier image fourni." });
    }
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable." });
    }

    const imageUrl = `/uploads/events/${req.file.filename}`;

    const newImage = await EventImage.create({
      url: imageUrl,
      eventId: id,
      votes: 0
    });
    return res.status(201).json({
      message: "Image ajoutée avec succès !",
      data: newImage
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout de l'image :", error);
    return res.status(500).json({ message: "Une erreur interne est survenue." });
  }
};

/**
 * Vote pour une image d'événement
 * POST /api/events/:id/images/:imageId/vote
 */
exports.voteImage = async (req, res) => {
  try {
    // 1. Décodage sécurisé de l'utilisateur depuis le middleware Auth
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "You must be logged in to vote" });
    }

    const { id: eventId, imageId } = req.params;
    const { stars } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "La note doit être comprise entre 1 et 5 étoiles." });
    }

    // 2. Recherche de l'image
    const image = await EventImage.findOne({
      where: { id: imageId, eventId: eventId }
    });

    if (!image) {
      return res.status(404).json({ message: "Image introuvable pour cet événement." });
    }

    // 3. Mise à jour du compteur de votes ou enregistrement du vote
    const newRating = (image.votes || 0) + parseInt(stars, 10);
    await image.update({ votes: newRating });

    return res.status(200).json({
      message: "Vote pris en compte avec succès !",
      data: image
    });

  } catch (error) {
    console.error("Erreur lors du vote :", error);
    return res.status(500).json({ message: "Une erreur interne est survenue lors du vote." });
  }
};