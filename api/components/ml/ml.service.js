const axios = require('axios');

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
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/writing`, {
      params: { url },
    });
    const fake = response.data.fake * 100;
    const real = response.data.real * 100;
    return {
      real,
      fake,
      message: writingMessage[parseInt(real / 20)],
    };
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getClickbait(url) {
  try {
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/clickbait`, {
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
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/sentiment`, {
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
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/classify`, {
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

    return {
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
        message: writingMessage[parseInt(real / 20)],
      },
    };
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
    throw 'Could not fetch report';
  }
}

async function getKeywords(text) {
  if (text.split(' ').length > 1) {
    try {
      const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/keywords`, {
        params: { text },
      });
      return response.data;
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) throw e.response.data.message;
      throw 'Could not fetch keywords';
    }
  } else {
    return { keywords: [ text ] };
  }
}
