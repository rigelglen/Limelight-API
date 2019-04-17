const axios = require('axios');

module.exports = {
  getSentiment,
  getClickbait,
  getKeywords,
  getClassification
};


async function getClickbait(url) {
  try {
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/clickbait`, { params: { url } });
    return response.data;
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getSentiment(url) {
  try {
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/sentiment`, { params: { url } });
    return { compound: response.data.compound, negative: response.data.neg, positive: response.data.pos, neutral: response.data.neu };
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getClassification(url) {
  try {
    const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/classify`, { params: { url } });
    return {
      clickbait: {
        clickbait: response.data.clickbait.clickbait * 100,
        news: response.data.clickbait.news * 100
      },
      sentiment: {
        compound: response.data.sentiment.compound * 100,
        negative: response.data.sentiment.neg * 100,
        positive: response.data.sentiment.pos * 100,
        neutral: response.data.sentiment.neu * 100
      }
    };
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getKeywords(text) {
  if (text.split(' ').length > 1) {
    try {
      const response = await axios.get(`http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/keywords`, { params: { text } });
      return response.data;
    } catch (e) {
      throw 'Could not fetch keywords';
    }
  } else {
    return { keywords: [text] };
  }
}