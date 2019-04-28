const request = require('supertest');
const { populateUsers, populateTopics, topics, users, userJwts } = require('./../../util/test.seed');
const { app } = require('./../../server');
const { mongoose, redisClient } = require('./../../core/db');
const { ObjectID } = require('mongodb');

var agent = request.agent(app);

beforeAll(populateUsers);
beforeAll(populateTopics);

describe('Feed', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterAll(() => {
    mongoose.connection.close();
    mongoose.disconnect();
    redisClient.quit();
  });

  describe('GET /feed/getFeed', () => {
    test(`it should get the feed when user isn't following any topics`, (done) => {
      agent
        .get('/feed/getFeed')
        .query({ page: 1 })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should get the feed when user is following some topics`, (done) => {
      agent
        .get('/feed/getFeed')
        .query({ page: 1 })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[1]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should get the second page`, (done) => {
      agent
        .get('/feed/getFeed')
        .query({ page: 2 })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('GET /feed/getFeedByTopic', () => {
    test(`it should get the feed when topicId is valid`, (done) => {
      agent
        .get('/feed/getFeedByTopic')
        .query({ page: 1, topicId: topics[0]._id.toHexString() })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should get the second page of the feed when topicId is valid`, (done) => {
      agent
        .get('/feed/getFeedByTopic')
        .query({ page: 2, topicId: topics[0]._id.toHexString() })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should not get the feed when topic doesnt exist`, (done) => {
      agent
        .get('/feed/getFeedByTopic')
        .query({ page: 1, topicId: new ObjectID().toHexString() })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('GET /feed/getFeedBySearch', () => {
    test(`it should get the feed for a query`, (done) => {
      const searchString = 'tech';
      agent
        .get('/feed/getFeedBySearch')
        .query({ page: 1, searchString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should get the second page of the search feed`, (done) => {
      const searchString = 'tech';

      agent
        .get('/feed/getFeedBySearch')
        .query({ page: 2, searchString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('GET /feed/getFeedByCategory', () => {
    test(`it should get the feed for a category string`, (done) => {
      const categoryString = 'business';
      agent
        .get('/feed/getFeedByCategory')
        .query({ page: 1, categoryString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should get the second page of the category string`, (done) => {
      const categoryString = 'business';

      agent
        .get('/feed/getFeedByCategory')
        .query({ page: 2, categoryString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });

    test(`it should give an error when string is not a category`, (done) => {
      const categoryString = 'tech';

      agent
        .get('/feed/getFeedByCategory')
        .query({ page: 1, categoryString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
});
