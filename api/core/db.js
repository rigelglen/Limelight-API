const mongoose = require('mongoose');
const User = require('./../components/users/user.model');
const Topic = require('./../components/topic/topic.model');
const redis = require('redis');
const { promisify } = require('util');

mongoose.Promise = global.Promise;
const dbOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 5,
}
let redisClient;
let getRedis;
let setRedis;
let getRedisMulti;
let setRedisMulti;
try {
    redisClient = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, auth_pass: process.env.REDIS_PASSWORD });
    getRedis = promisify(redisClient.get).bind(redisClient);
    setRedis = promisify(redisClient.set).bind(redisClient);
    getRedisMulti = promisify(redisClient.mget).bind(redisClient);
    setRedisMulti = promisify(redisClient.mset).bind(redisClient);
    // redisClient.on('connect', () => console.log('Successfully connected to redis!'));
} catch (e) {
    console.error(e);
}

const url = process.env.NODE_ENV == 'test' ?
    `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGODB_DB_TEST}?authSource=admin`
    : `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGODB_DB}?authSource=admin`;

mongoose.connect(url, dbOptions).catch((ex) => {
    process.exit(1);
});

module.exports = {
    User,
    Topic,
    mongoose,
    setRedis,
    getRedis,
    redisClient,
    getRedisMulti,
    setRedisMulti
};