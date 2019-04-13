const mongoose = require('mongoose');
const User = require('./../components/users/user.model');
const Topic = require('./../components/topic/topic.model');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV == 'test') {
    let url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGODB_DB_TEST}?authSource=admin`;
    console.log('db url is ' + url)
    mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true });
}
else {
    let url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGODB_DB}?authSource=admin`;
    console.log('db url is ' + url)
    mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true });
}
module.exports = {
    User,
    Topic,
    mongoose
};