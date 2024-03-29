const mongoose = require('mongoose');
const User = require('./../components/users/user.model');
const Topic = require('./../components/topic/topic.model');
const redis = require('redis');
const { promisify } = require('util');
const logger = require('./logger');

mongoose.Promise = global.Promise;

let redisClient;
let redisClientReport;
let getRedisReport;
let setRedisReport;
let getRedisMulti;
let setRedisMulti;

try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth_pass: process.env.REDIS_PASSWORD,
  });

  redisClientReport = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth_pass: process.env.REDIS_PASSWORD,
    db: 1,
  });

  getRedisReport = promisify(redisClientReport.get).bind(redisClientReport);
  setRedisReport = promisify(redisClientReport.set).bind(redisClientReport);
  getRedisMulti = promisify(redisClient.mget).bind(redisClient);
  setRedisMulti = promisify(redisClient.mset).bind(redisClient);
  if (process.env.NODE_ENV === 'development')
    redisClient.on('connect', () => logger.info('Successfully connected to redis!'));
} catch (e) {
  logger.error(e.message);
}

async function connectMongo() {
  const dbOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 5,
  };

  const url =
    process.env.NODE_ENV === 'test'
      ? `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env
          .MONGO_HOST}/${process.env.MONGODB_DB_TEST}?authSource=admin`
      : `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env
          .MONGO_HOST}/${process.env.MONGODB_DB}?authSource=admin`;
  try {
    await mongoose.connect(url, dbOptions);
    if (process.env.NODE_ENV === 'development') logger.info(`Connected to MongoDB`);
  } catch (e) {
    process.exit(1);
  }
}

async function disconnectMongo() {
  await mongoose.connection.close();
  await mongoose.disconnect();
}

async function disconnectRedis() {
  await new Promise((resolve, reject) => {
    redisClient.quit(() => {
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    redisClientReport.quit(() => {
      resolve();
    });
  });
}

module.exports = {
  User,
  Topic,
  mongoose,
  setRedisReport,
  getRedisReport,
  redisClient,
  redisClientReport,
  getRedisMulti,
  setRedisMulti,
  connectMongo,
  disconnectMongo,
  disconnectRedis,
};
