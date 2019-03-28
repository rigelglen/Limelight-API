const express = require('express');
const router = express.Router();
const feedService = require('../feed/feed.service');
const ObjectId = require('mongoose').Types.ObjectId;


router.get('/getFeed', validateFeed, getFeed);
router.get('/getFeedByTopic', validateFeed, getFeedByTopic);
router.get('/getFeedBySearch', validateFeed, getFeedBySearch)

module.exports = router;

function getFeed(req, res, next) {
  feedService.getFeed(req.user.sub, req.body.page)
    .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
    .catch(err => next(err));
}

function getFeedByTopic(req, res, next) {
  feedService.getFeedByTopic(req.body.topicId, req.body.page)
    .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
    .catch(err => next(err));
}

function getFeedBySearch(req, res, next) {
  feedService.getFeedBySearch(req.body.searchString, req.body.page)
    .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
    .catch(err => next(err));
}

function validateFeed(req, res, next) {

  if (req.body.searchString && req.body.searchString.length === 0) {
    throw 'Invalid parameter searchString';
  }

  if (req.body.topicId && !ObjectId.isValid(req.body.topicId)) {
    throw 'Invalid parameter topicId';
  }

  if (req.body.page && !isNaN(parseInt(req.body.page)) && req.body.page > 0) {
    req.body.page = parseInt(req.body.page);
  }
  else {
    throw 'Invalid parameter page';
  }
  next();
}
