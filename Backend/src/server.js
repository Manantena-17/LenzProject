const app = require('./app'); // Assure-toi que ce chemin pointe bien vers ton app.js
const sequelize = require('./config/db');

// On change de port pour éviter les conflits (on prend 5500)
const PORT = 5500; 

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    
    await sequelize.sync();
    console.log('✅ Base de données synchronisée.');

    // C'EST CE BLOC QUI MAINTIENT LE SERVEUR ALLUMÉ :
    app.listen(PORT, () => {
      console.log(`🚀 LE VRAI SERVEUR EST EN LIGNE SUR : http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error);
  }
}

startServer();