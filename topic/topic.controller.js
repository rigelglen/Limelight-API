const express = require('express');
const router = express.Router();
const topicService = require('./topic.service');

router.post('/getFollows', getFollows);

module.exports = router;

function getFollows(req, res, next) {
    topicService.getFollows(req.user.sub)
        .then(topics => topics ? res.json(topics) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}