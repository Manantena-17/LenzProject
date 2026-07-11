const app = require('./app'); 
const sequelize = require('./config/db');
const PORT = 5500; 
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    await sequelize.sync();
    console.log('✅ Base de données synchronisée.');
    app.listen(PORT, () => {
      console.log(`🚀 LE VRAI SERVEUR EST EN LIGNE SUR : http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error);
  }
}

startServer();