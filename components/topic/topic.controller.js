const express = require('express');
const router = express.Router();
const topicService = require('./topic.service');

router.get('/getFollows', getFollows);
router.post('/addFollow', addFollow);
router.post('/removeFollow', removeFollow);
router.get('/getFeed', getFeed);
router.get('/getFeedByTopic', getFeedByTopic);
router.get('/getFeedBySearch', getFeedBySearch)

module.exports = router;

function getFollows(req, res, next) {
    topicService.getFollows(req.user.sub)
        .then(topics => topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}

function addFollow(req, res, next) {
    topicService.addFollow(req.user.sub, req.body.topicString)
        .then(topics => topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}

function removeFollow(req, res, next) {
    topicService.removeFollow(req.user.sub, req.body.topicId)
        .then(topics => topics ? res.json(topics) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}

function getFeed(req, res, next) {
    topicService.getFeed(req.user.sub, req.body.page)
        .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}

function getFeedByTopic(req, res, next) {
    topicService.getFeedByTopic(req.body.topicId, req.body.page)
        .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}

function getFeedBySearch(req, res, next) {
    topicService.getFeedByTopic(req.body.searchString, req.body.page)
        .then(feed => feed ? res.json(feed) : res.status(400).json({ message: 'An error occured.' }))
        .catch(err => next(err));
}


