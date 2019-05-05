const express = require('express');
const mlService = require('./ml.service');
const router = express.Router();

router.get('/checkClickbait', validateUrl, getClickbait);
router.get('/checkWritingStyle', validateUrl, getWritingStyle);
router.get('/checkSentiment', validateUrl, getSentiment);
router.get('/getKeywords', getKeywords);
router.get('/getClassification', validateUrl, getClassification);
router.post('/getClassificationText', getClassificationText);

module.exports = router;

function getClickbait(req, res, next) {
  mlService
    .getClickbait(addHttp(req.query.url))
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getWritingStyle(req, res, next) {
  mlService
    .getWritingStyle(addHttp(req.query.url))
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getSentiment(req, res, next) {
  mlService
    .getSentiment(addHttp(req.query.url))
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getKeywords(req, res, next) {
  mlService
    .getKeywords(req.user.sub, req.query.text)
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getClassification(req, res, next) {
  mlService
    .getClassification(addHttp(req.query.url))
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function getClassificationText(req, res, next) {
  mlService
    .getClassificationText(req.body)
    .then((data) => (data ? res.json(data) : res.status(400).json({ message: 'An error occured.' })))
    .catch((err) => next(err));
}

function addHttp(url) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'http://' + url;
  }
  return url;
}

function validateUrl(req, res, next) {
  if (req.query.url && req.query.url.length === 0) {
    throw 'Invalid parameter url';
  }

  if (!req.query.url && (!req.query.title && !req.query.text)) {
    throw 'Please give title or text';
  }

  next();
}
