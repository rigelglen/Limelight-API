const request = require('supertest');
const { populateUsers, populateTopics, topics, users, userJwts } = require('./../../util/test.seed');
const { app } = require('./../../server');
const { mongoose, redisClient } = require('./../../core/db');

var agent = request.agent(app);

beforeAll(populateUsers);
beforeAll(populateTopics);

describe('Topics', () => {
  afterAll(() => {
    mongoose.connection.close();
    mongoose.disconnect();
    redisClient.quit();
  });

  describe('POST /topic/addFollow', () => {
    test('it should add a pre-existing follow', (done) => {
      let topicString = topics[0].name;
      agent
        .post('/topic/addFollow')
        .send({ topicString })
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

    test('it should add a new follow', (done) => {
      let topicString = 'business';
      agent
        .post('/topic/addFollow')
        .send({ topicString })
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

    test('it should not readd a follow', (done) => {
      let topicString = topics[0].name;
      agent
        .post('/topic/addFollow')
        .send({ topicString })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[1]}`)
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('POST /topic/removeFollow', () => {
    test('it should unfollow a topic of a user', (done) => {
      let topicId = topics[0]._id;
      agent
        .post('/topic/removeFollow')
        .send({ topicId })
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

    test('it should not unfollow a non-followed topic', (done) => {
      let topicId = topics[1]._id;
      agent
        .post('/topic/removeFollow')
        .send({ topicId })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userJwts[1]}`)
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
});
