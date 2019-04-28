const request = require('supertest');
const { populateUsers, populateTopics, topics, users } = require('./../../util/test.seed');
const { app } = require('./../../server');
const { mongoose, redisClient } = require('./../../core/db');

var agent = request.agent(app);

beforeAll(populateUsers);
beforeAll(populateTopics);

describe('Users', () => {
  afterAll(() => {
    mongoose.connection.close();
    mongoose.disconnect();
    redisClient.quit();
  });

  describe('POST /users/register', () => {
    test('it should create a new user', (done) => {
      const email = 'test@test.com';
      const password = 'userPass';
      agent
        .post('/users/register')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });

    test('it should validate the email', (done) => {
      const email = 'test@test';
      const password = 'userPass';
      agent
        .post('/users/register')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });

    test('it should check for valid passwords', (done) => {
      const email = 'test@test.com';
      const password = 'abcd';
      agent
        .post('/users/register')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });

    test('it should not create duplicate emails', (done) => {
      const email = users[0].email;
      const password = 'userPass';
      agent
        .post('/users/register')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });
  });

  describe('POST /users/login', () => {
    test('it should login a user', (done) => {
      const email = users[0].email;
      const password = 'userPass';
      agent
        .post('/users/authenticate')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });

    test('it fail to authenticate user with wrong password', (done) => {
      const email = users[0].email;
      const password = 'userPass1';
      agent
        .post('/users/authenticate')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => done())
        .catch((err) => {
          console.log(err.text);
          console.log(err);
          done(err);
        });
    });
  });
});
