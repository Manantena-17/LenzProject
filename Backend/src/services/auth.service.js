const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError'); 
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_securisee';

exports.register = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Cet email est déjà utilisé', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hashedPassword });
};


exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Identifiants invalides', 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Identifiants invalides', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  return { token, user };
};


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