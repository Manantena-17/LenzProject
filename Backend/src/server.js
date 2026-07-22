const app = require('./app'); 
const { sequelize } = require('./config/db');

const PORT = 5500;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');

    
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données et tables (User, Event, EventImage, Vote) synchronisées.');

    app.listen(PORT, () => {
      console.log(`🚀 LE VRAI SERVEUR EST EN LIGNE SUR : http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error);
  }
}

startServer();