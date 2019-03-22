const express = require('express');
const router = express.Router();
const feedService = require('../feed/feed.service');

router.get('/getFeed', getFeed);
router.get('/getFeedByTopic', getFeedByTopic);
router.get('/getFeedBySearch', getFeedBySearch)

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


