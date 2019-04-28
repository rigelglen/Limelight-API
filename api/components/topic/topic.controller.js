const express = require('express');
const router = express.Router();
const topicService = require('./topic.service');
const ObjectId = require('mongoose').Types.ObjectId;

router.get('/getFollows', validateTopic, getFollows);
router.post('/addFollow', validateTopic, addFollow);
router.post('/removeFollow', validateTopic, removeFollow);

module.exports = router;

function getFollows(req, res, next) {
  topicService
    .getFollows(req.user.sub)
    .then((topics) => (topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function addFollow(req, res, next) {
  topicService
    .addFollow(req.user.sub, req.body.topicString)
    .then((topics) => (topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function removeFollow(req, res, next) {
  topicService
    .removeFollow(req.user.sub, req.body.topicId)
    .then((topics) => (topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function validateTopic(req, res, next) {
  if (req.body.topicString && req.body.topicString.length === 0) {
    throw 'Invalid parameter topicString';
  }

  if (req.body.topicId && !ObjectId.isValid(req.body.topicId)) {
    throw 'Invalid parameter topicId';
  }
  next();
}
