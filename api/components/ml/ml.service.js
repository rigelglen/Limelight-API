const axios = require('axios');

module.exports = {
  getSentiment,
  getClickbait
};


async function getClickbait(url) {
  try {
    const response = await axios.get(`${process.env.FLASK_URI}/clickbait`, { params: { url } });
    return response.data;
  } catch (e) {
    throw 'Could not fetch report';
  }
}

async function getSentiment(url) {
  try {
    const response = await axios.get(`${process.env.FLASK_URI}/sentiment`, { params: { url } });
    return { compound: response.data.compound, negative: response.data.neg, positive: response.data.pos, neutral: response.data.neu };
  } catch (e) {
    throw 'Could not fetch report';
  }
}