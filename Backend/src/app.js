const express = require('express');
const cors = require('cors');
const path = require('path');
const errorMiddleware = require('./middlewares/error.middleware');
const eventRouter = require('./routes/event.route');
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');

const app = express();


app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/favicon.ico', (req, res) => res.status(204).end());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/events', eventRouter); 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use((req, res, next) => {
  console.log(`❌ 404 [${req.method}] ${req.originalUrl}`);
  const error = new Error(`Route non trouvée : ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});


app.use(errorMiddleware);

module.exports = app;