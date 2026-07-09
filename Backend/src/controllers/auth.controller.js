
const authService = require('../services/auth.service');

// Inscription
exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    next(error); // Transmet l'erreur au error.middleware
  }
};

// connexion
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};