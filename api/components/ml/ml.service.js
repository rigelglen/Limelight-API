const axios = require('axios');
const db = require('./../../core/db');
const Topic = db.Topic;
const User = db.User;
const _ = require('lodash');
const { getRedisReport, setRedisReport } = require('../../core/db');

const writingStyleUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/writing`;
const clickbaitUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/clickbait`;
const sentimentUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/sentiment`;
const classificationUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/classify`;
const keywordsUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/keywords`;

const { disclaimer, clickbaitMessage, writingMessage, sentimentMessage } = require('../../core/strings');

module.exports = {
  getSentiment,
  getClickbait,
  getKeywords,
  getClassification,
  getWritingStyle,
};

async function getWritingStyle(url) {
  try {
    const response = await axios.get(writingStyleUrl, {
      params: { url },
    });
    const fake = response.data.fake * 100;
    const real = response.data.real * 100;
    return {
      real,
      fake,
      message: writingMessage[parseInt(real / 10)],
    };
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getClickbait(url) {
  try {
    const response = await axios.get(clickbaitUrl, {
      params: { url },
    });
    const clickbait = response.data.clickbait * 100;
    const news = response.data.news * 100;

    return {
      clickbait,
      news,
      message: clickbaitMessage[parseInt(clickbait / 20)],
    };
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getSentiment(url) {
  try {
    const response = await axios.get(sentimentUrl, {
      params: { url },
    });
    const compound = response.data.compound * 100;
    const negative = response.data.neg * 100;
    const positive = response.data.pos * 100;
    const neutral = response.data.neu * 100;

    const sentiMessage =
      sentimentMessage[[ negative, neutral, positive ].indexOf(Math.max(...[ negative, neutral, positive ]))];

    return {
      compound,
      negative,
      positive,
      neutral,
      message: sentiMessage,
    };
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getClassification(url) {
  try {
    const reportRedis = await getRedisReport(url);
    if (reportRedis) {
      return JSON.parse(reportRedis);
    }

    const response = await axios.get(classificationUrl, {
      params: { url },
    });

    const clickbait = response.data.clickbait.clickbait * 100;
    const news = response.data.clickbait.news * 100;
    const compound = response.data.sentiment.compound * 100;
    const negative = response.data.sentiment.neg * 100;
    const positive = response.data.sentiment.pos * 100;
    const neutral = response.data.sentiment.neu * 100;
    const fake = response.data.writing.fake * 100;
    const real = response.data.writing.real * 100;

    const sentiMessage =
      sentimentMessage[[ negative, neutral, positive ].indexOf(Math.max(...[ negative, neutral, positive ]))];

    const report = {
      disclaimer,
      clickbait: {
        clickbait,
        news,
        message: clickbaitMessage[parseInt(clickbait / 20)],
      },
      sentiment: {
        compound,
        negative,
        positive,
        neutral,
        message: sentiMessage,
      },
      writing: {
        fake,
        real,
        message: writingMessage[parseInt(real / 10)],
      },
    };

    await setRedisReport(url, JSON.stringify(report));

    return report;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getKeywords(uid, text) {
  text = text.trim().toLowerCase();
  if (text.split(' ').length > 1) {
    try {
      let userObj = User.findById(uid);
      let response = axios.get(keywordsUrl, {
        params: { text },
      });
      [ userObj, response ] = await Promise.all([ userObj, response ]);

      let tp = await Topic.find({ name: { $in: response.data.keywords } }).select('name _id');

      const keywordsFollowed = tp
        .map((topic) => {
          if (userObj.follows.indexOf(topic._id) !== -1) {
            return topic.name;
          } else {
            return undefined;
          }
        })
        .filter((n) => n);
      const finalFilter = response.data.keywords.filter((keyword) => !keywordsFollowed.includes(keyword));
      return { keywords: finalFilter };
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
      throw 'Could not fetch keywords';
    }
  } else {
    let userObj = User.findById(uid);
    let tp = Topic.findOne({ name: text }).select('-cache');
    [ userObj, tp ] = await Promise.all([ userObj, tp ]);
    if (tp && userObj.follows.indexOf(tp._id) !== -1) {
      return { keywords: [] };
    } else {
      return { keywords: [ text ] };
    }
  }
}
