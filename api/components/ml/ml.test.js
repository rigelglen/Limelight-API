const request = require('supertest');
const { populateUsers, populateTopics, topics, users, userJwts } = require('./../../util/test.seed');
const { app } = require('./../../server');
const { mongoose } = require('./../../core/db');

var agent = request.agent(app);

beforeAll(populateUsers);
beforeAll(populateTopics);

describe('Machine Learning', () => {

  beforeAll(() => {
    jest.setTimeout(30000);
  })

  afterAll(() => {
    mongoose.connection.close();
    mongoose.disconnect()
  });

  describe('GET /ml/checkClickbait', () => {

    test(`it should check if article url is clickbait`, (done) => {
      const url = `https://www.deccanherald.com/business/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkClickbait')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

    test(`it should error if url is not valid`, (done) => {
      const url = `https://deccandherald/business/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkClickbait')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

    test(`it should error if url is not found`, (done) => {
      const url = `https://deccandherald.com/busasdasdasdadiness/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkClickbait')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

  });

  describe('GET /ml/checkSentiment', () => {

    test(`it should return a sentiment array`, (done) => {
      const url = `https://www.deccanherald.com/business/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkSentiment')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

    test(`it should error if url is not valid`, (done) => {
      const url = `https://deccandherald/business/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkSentiment')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

    test(`it should error if url is not found`, (done) => {
      const url = `https://deccandherald.com/busasdasdasdadiness/battle-of-streaming-platforms-727427.html`;

      agent
        .get('/ml/checkSentiment')
        .query({ url })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(400)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

  });

  describe('GET /ml/getKeywords', () => {

    test(`it should return a keyword array based on title`, (done) => {
      const text = `Are pandas extinct`;

      agent
        .get('/ml/getKeywords')
        .query({ text })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => done())
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

    test(`it should return the same keyword if only one word is sent`, (done) => {
      const text = `Panda`;

      agent
        .get('/ml/getKeywords')
        .query({ text })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${userJwts[0]}`)
        .expect(200)
        .then((res) => {
          if (JSON.parse(res.text).keywords.length == 1)
            done()
          else {
            throw 'Returns more than one error';
          }
        })
        .catch(err => {
          console.log(err);
          done(err)
        });
    });

  });


});