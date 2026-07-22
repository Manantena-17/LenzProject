// Import des modèles Sequelize
const { Vote, EventImage } = require('../models'); // Adaptez le chemin selon votre structure (ex: ../models)

const addOrUpdateVote = async ({ userId, imageId, stars }) => {

  await Vote.upsert({
    userId,
    imageId,
    stars,
  });

  const votes = await Vote.findAll({
    where: { imageId }
  });

  const totalVotes = votes.length;
  const ratingSum = votes.reduce((acc, curr) => acc + curr.stars, 0);
  const averageRating = totalVotes > 0 ? ratingSum / totalVotes : 0;
  const image = await EventImage.findByPk(imageId);

  if (!image) {
    throw new Error("L'image demandée n'existe pas.");
  }

  await image.update({
    votes: totalVotes,
    ratingSum: ratingSum,
    averageRating: averageRating,
  });

  return image;
};

module.exports = {
  addOrUpdateVote,
};