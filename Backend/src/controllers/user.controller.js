const authService = require('../services/auth.service'); // On réutilise les fonctions de BDD

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUser(req.params.id, req.body);
    res.status(200).json({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await authService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};