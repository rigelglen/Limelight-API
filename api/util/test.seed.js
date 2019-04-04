const { ObjectID } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const User = require('./../components/users/user.model');
const Topic = require('./../components/topic/topic.model');
const bcrypt = require('bcryptjs');

const topicOneId = new ObjectID();
const topicTwoId = new ObjectID();

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'abc1@example.com',
        hash: bcrypt.hashSync("userPass", 10),
        follows: []
    }, {
        _id: userTwoId,
        email: 'abc2@example.com',
        hash: bcrypt.hashSync("userPass", 10),
        follows: [topicOneId]
    }
];
const secret = process.env.SECRET;
const userJwts = [jwt.sign({ sub: users[0]._id }, secret), jwt.sign({ sub: users[1]._id }, secret)]

const topics = [{
    _id: topicOneId,
    name: 'sports',
    lastRefreshed: new Date()
}, {
    _id: topicTwoId,
    name: 'technology',
    lastRefreshed: new Date()
}];

const populateUsers = (done) => {
    User.deleteMany({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

const populateTopics = (done) => {
    Topic.deleteMany({}).then(() => {
        let topicOne = new Topic(topics[0]).save()
        let topicTwo = new Topic(topics[1]).save();

        return Promise.all([topicOne, topicTwo]);
    }).then(() => done());
};

module.exports = { populateUsers, populateTopics, topics, users, userJwts };


