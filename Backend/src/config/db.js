// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Pour charger les variables d'environnement

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, 
  }
);

// test connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données :', error);
  }
}

testConnection();

module.exports = sequelize;