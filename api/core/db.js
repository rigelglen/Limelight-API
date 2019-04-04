const mongoose = require('mongoose');
const User = require('./../components/users/user.model');
const Topic = require('./../components/topic/topic.model');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV == 'test')
    mongoose.connect(process.env.MONGODB_TEST_URI, { useCreateIndex: true, useNewUrlParser: true });
else
    mongoose.connect(process.env.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true });

module.exports = {
    User,
    Topic,
    mongoose
};