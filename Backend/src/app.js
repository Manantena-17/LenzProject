
const express = require('express');
const cors = require('cors'); 
const errorMiddleware = require('./middlewares/error.middleware');
const app = express();


app.use(cors());
app.use(express.json()); 


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects/:projectId/tasks', require('./routes/task.routes'));
app.use('/api/projects', require('./routes/project.routes'));

app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.statusCode = 404;
  next(error);
});
app.use(errorMiddleware);

module.exports = app;