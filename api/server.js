require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./core/jwt');
const errorHandler = require('./core/error-handler');
const helmet = require('helmet');

if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// use JWT auth to secure the api
app.use(jwt());

// api routes

app.use('/users', require('./components/users/users.controller'));
app.use('/topic', require('./components/topic/topic.controller'));
app.use('/feed', require('./components/feed/feed.controller'));
app.use('/ml', require('./components/ml/ml.controller'));

// global error handler
app.use(errorHandler);

module.exports = { app };
