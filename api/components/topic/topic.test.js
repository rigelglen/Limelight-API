const request = require('supertest');
const { populateUsers, populateTopics, topics, users, userJwts } = require('./../../util/test.seed');
const { app } = require('./../../server');
const { mongoose, redisClient, redisClientReport } = require('./../../core/db');
const use = require('superagent-use');
const captureError = require('supertest-capture-error');

const agent = use(request(app)).use(
  captureError((error, test) => {
    // modify error message to suit our needs:
    error.message += ` at ${test.url}\n` + `Response Body:\n${test.res.text}`;
    error.stack = ''; // this is useless anyway
  })
);
beforeAll(populateUsers);
beforeAll(populateTopics);

describe('Topics', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoose.disconnect();
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
          done(err);
        });
    });
  });
});
