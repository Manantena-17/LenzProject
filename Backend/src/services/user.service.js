const bcrypt = require('bcryptjs');
const { User } = require('../models'); 
const AppError = require('../utils/AppError'); 

exports.getAllUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ['password'] }
  });
};

exports.getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    throw new AppError('Utilisateur introuvable', 404);
  }
  return user;
};

exports.updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Utilisateur introuvable', 404);
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  return await user.update(updateData);
};

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Utilisateur introuvable', 404);
  }
  await user.destroy();
  return { message: "Utilisateur supprimé avec succès" };
};