const db = require('./../../core/db');
const Topic = db.Topic;
const User = db.User;
const moment = require('moment');
const newsApiKey = process.env.NEWS_API_KEY;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsApiKey);
const Feed = require('./../../util/rss2json');
const h2p = require('html2plaintext');
const numArticles = process.env.NUM_ARTICLES;
const gNews = process.env.GNEWS;
const facebookKey = process.env.FACEBOOK_KEY;
const axios = require('axios');
const grabity = require('grabity');

module.exports = {
  getFeed,
  getFeedByTopic,
  getFeedBySearch
};

async function getFeed(uid, page = 1) {
  const userObj = await User.findById(uid);
  const separator = gNews ? '|' : 'OR'
  const topicNames = await Topic.find({
    "_id": {
      $in: userObj.follows
    }
  }).select('name -_id');

  let queryString = "";

  topicNames.map((topic, index) => {
    if (index == 0) {
      queryString = `${topic.name}`;
    }
    else {
      queryString = `${queryString} ${separator} ${topic.name}`;
    }
  });

  let result = await queryNews(queryString, page);

  if (gNews) {
    return await paginate(result, page);
  }
  else {
    return result;
  }
}

async function queryNews(queryString, page, isCat = false) {
  if (gNews) {
    return await queryGNews(queryString, isCat);
  }
  else {
    return await queryNewsApi(queryString, page);
  }
}


async function queryNewsApi(queryString, page) {
  const response = await newsapi.v2.everything({
    q: queryString,
    language: 'en',
    sortBy: 'relevancy',
    page: page,
    pageSize: 30,
  });

  let result = response.articles.map((article) => {
    return {
      title: article.title,
      source: article.source.name,
      description: article.description,
      link: article.url,
      image: article.urlToImage,
      publishedAt: moment(article.publishedAt).unix()
    }
  });
  return result;
}

async function queryGNews(queryString, isCat) {
  let url = "https://news.google.com/rss";
  if (queryString.length > 0)
    url = isCat ? `https://news.google.com/news/rss/headlines/section/topic/${queryString.toUpperCase()}` :
      `https://news.google.com/rss/search?q=${queryString}`;


  try {
    const rss = await Feed.load(url);
    const result = rss.items.map((article) => {
      return {
        title: article.title,
        source: article.source,
        description: isCat ? undefined : h2p(article.description).split("\n\n")[1],
        link: article.link,
        image: article.media ? article.media.content[0].url[0] : undefined,
        publishedAt: article.created
      }
    });

    return result;

  } catch (err) {
    return err;
  }
}


async function getFeedByTopic(topicId, page = 1) {
  const topic = await Topic.findById(topicId);
  if (!topic)
    throw 'Topic not found';
  let result;

  const lastRefreshedDate = moment(topic.lastRefreshed);
  const currentRefreshDate = moment();

  if ((lastRefreshedDate.diff(currentRefreshDate, 'hours') > 3 || !topic.cache) || (!gNews && page !== 1)) {
    result = await queryNews(topic.name, page, topic.isCat);
    if (page === 1) {
      topic.cache = result;
      topic.lastRefreshed = new Date();
      await topic.save();
    }
  }

  else if (topic.cache) {
    result = topic.cache;
  }

  if (gNews)
    return await addMetaData(paginate(result, page));
  else
    return result;
}

async function getFeedBySearch(searchString, page = 1) {
  let result = await queryNews(searchString, page);
  if (gNews)
    return await addMetaData(paginate(result, page));
  else
    return result;
}

// async function addMetaData(articles) {
//   let imgUrl;
//   return await Promise.all(articles.map(async (article) => {
//     try {
//       const response = await grabity.grabIt(`${article.link}`);
//       imgUrl = response.image;
//       article.title = response.title;
//       article.description = response.description;
//       // article.source = response.data.site_name;
//       article.image = article.image ? article.image : imgUrl;
//     } catch (error) {
//       return article;
//     }
//     return article;
//   }));
// }

async function addMetaData(articles) {
  let imgUrl;
  return await Promise.all(articles.map(async (article) => {
    try {
      const response = await axios.post(`https://graph.facebook.com/v3.2/?scrape=true&id=${article.link}&access_token=${facebookKey}`);
      imgUrl = response.data.image[0].secure_url ? response.data.image[0].secure_url : response.data.image[0].url;
      article.title = response.data.title;
      article.description = response.data.description;
      article.source = response.data.site_name;
      article.image = article.image ? article.image : imgUrl;

    } catch (error) {
      return article;
    }
    return article;
  }));
}


function paginate(data, page) {
  const startIndex = (page - 1) * numArticles;
  const endIndex = page * numArticles;

  if (endIndex < data.length)
    data = data.slice(startIndex, endIndex);
  else
    data = data.slice(startIndex, data.length - 1);

  return data;
}