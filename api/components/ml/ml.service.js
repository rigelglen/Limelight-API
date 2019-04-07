const axios = require('axios');
const nlp = require('compromise');
const rake = require('rake-js')

module.exports = {
  getSentiment,
  getClickbait,
  getKeywords
};


async function getClickbait(url) {
  try {
    const response = await axios.get(`${process.env.FLASK_URI}:${process.env.FLASK_PORT}/clickbait`, { params: { url } });
    return response.data;
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getSentiment(url) {
  try {
    const response = await axios.get(`${process.env.FLASK_URI}:${process.env.FLASK_PORT}/sentiment`, { params: { url } });
    return { compound: response.data.compound, negative: response.data.neg, positive: response.data.pos, neutral: response.data.neu };
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getKeywords(text) {
  if (text.split(' ').length > 1) {
    try {
      const response = await axios.get(`${process.env.FLASK_URI}:${process.env.FLASK_PORT}/keywords`, { params: { text } });
      return response.data;
    } catch (e) {
      throw 'Could not fetch keywords';
    }
  } else {
    return { keywords: [text] };
  }
}