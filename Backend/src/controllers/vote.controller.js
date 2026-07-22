const voteService = require('../services/vote.service');
const submitVote = async (req, res) => {
  try {
    const imageId = req.params.imageId || req.body.imageId; 
    const stars = req.body.stars || req.body.note;

    const userId = req.user ? req.user.id : req.body.userId;

    if (!imageId) {
      return res.status(400).json({ message: "L'identifiant de l'image est requis." });
    }
    if (!userId) {
      return res.status(401).json({ message: "Vous devez être connecté pour voter." });
    }

    if (stars === undefined || stars === null || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "La note (stars) doit être comprise entre 1 et 5." });
    }
    const updatedImage = await voteService.addOrUpdateVote({
      userId: Number(userId),
      imageId: Number(imageId),
      stars: Number(stars),
    });

    return res.status(200).json({
      message: 'Vote enregistré avec succès.',
      image: updatedImage,
    });

  } catch (error) {
    console.error('Erreur lors du vote :', error);
    return res.status(500).json({
      message: error.message || 'Une erreur est survenue lors de l’enregistrement du vote.',
    });
  }
};
module.exports = {
  submitVote,
};