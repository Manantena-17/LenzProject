const express = require('express');
const cors = require('cors'); 
const errorMiddleware = require('./middlewares/error.middleware');

// 1. Importation de tes deux routeurs séparés (Principe S de SOLID)
const authRouter = require('./routes/auth.route'); 
const userRouter = require('./routes/user.route'); 

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Séparation propre de tes préfixes d'URL
app.use('/api/auth', authRouter); // Ne gère que l'authentification (/register, /login)
app.use('/api/users', userRouter); // Ne gère que le CRUD des utilisateurs

// Gestion des routes non trouvées (404)
app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.statusCode = 404;
  next(error);
});

// Middleware centralisé de gestion des erreurs
app.use(errorMiddleware);

module.exports = app;