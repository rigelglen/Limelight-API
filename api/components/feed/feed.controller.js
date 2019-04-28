const express = require('express');
const router = express.Router();
const feedService = require('./feed.service');
const ObjectId = require('mongoose').Types.ObjectId;

router.get('/getFeed', validateFeed, getFeed);
router.get('/getFeedByTopic', validateFeed, getFeedByTopic);
router.get('/getFeedBySearch', validateFeed, getFeedBySearch);
router.get('/getFeedByCategory', validateFeed, getFeedByCategory);

module.exports = router;

function getFeed(req, res, next) {
  feedService
    .getFeed(req.user.sub, req.query.page)
    .then((feed) => (feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getFeedByTopic(req, res, next) {
  feedService
    .getFeedByTopic(req.query.topicId, req.query.page)
    .then((feed) => (feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getFeedBySearch(req, res, next) {
  feedService
    .getFeedBySearch(req.query.searchString, req.query.page)
    .then((feed) => (feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getFeedByCategory(req, res, next) {
  feedService
    .getFeedByCategory(req.user.sub, req.query.categoryString, req.query.page)
    .then((feed) => (feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function validateFeed(req, res, next) {
  if (req.query.searchString && req.query.searchString.length === 0) {
    throw 'Invalid parameter searchString';
  }

  if (req.query.categoryString && req.query.categoryString.length === 0) {
    throw 'Invalid parameter categoryString';
  }

  if (req.query.topicId && !ObjectId.isValid(req.query.topicId)) {
    throw 'Invalid parameter topicId';
  }

  if (req.query.page && !isNaN(parseInt(req.query.page)) && req.query.page > 0) {
    req.query.page = parseInt(req.query.page);
  } else {
    throw 'Invalid parameter page';
  }
  next();
}
