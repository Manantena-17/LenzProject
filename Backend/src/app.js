const express = require('express');
const cors = require('cors'); 
const errorMiddleware = require('./middlewares/error.middleware');

const eventRouter = require('./routes/event.route');
const authRouter = require('./routes/auth.route'); 
const userRouter = require('./routes/user.route'); 

const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter); 
app.use('/api/users', userRouter); 

app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;