require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./core/jwt');
const errorHandler = require('./core/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

var a = 3;
// api routes

app.use('/users', require('./components/users/users.controller'));
app.use('/topic', require('./components/topic/topic.controller'));
app.use('/feed', require('./components/feed/feed.controller'));
app.use('/ml', require('./components/ml/ml.controller'));

// global error handler
app.use(errorHandler);

module.exports = { app };