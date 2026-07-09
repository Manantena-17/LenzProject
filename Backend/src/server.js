
require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée.');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error);
  }
};

startServer();