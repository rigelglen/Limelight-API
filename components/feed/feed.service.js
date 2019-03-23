const db = require('core/db');
const Topic = db.Topic;
const User = db.User;
const moment = require('moment');
const newsApiKey = process.env.newsApiKey || require('config.json').newsApiKey;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsApiKey);
const Feed = require('util/rss2json');
const h2p = require('html2plaintext');
const numArticles = require('config.json').numArticles;
const gNews = require('config.json').gNews;
const facebookKey = process.env.facebookKey || require('config.json').facebookKey;
const axios = require('axios');

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
  let flag = 0;

  topicNames.map((topic) => {
    if (flag == 0) {
      queryString = `${topic.name}`;
      flag = 1;
    }
    else {
      queryString = `${queryString} ${separator} ${topic.name}`;
    }
  });

  if (gNews) {
    let result = await queryNews(queryString, page);
    result = result.sort((a, b) => b.publishedAt - a.publishedAt);

    return await addMetaData(paginate(result, page));
    // return await paginate(result, page);
  }
  else {
    return await queryNews(queryString, page);
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
  const url = isCat ? `https://news.google.com/news/rss/headlines/section/topic/${queryString.toUpperCase()}` :
    `https://news.google.com/rss/search?q=${queryString}`;

  return new Promise((resolve, reject) => {
    Feed.load(url, async function (err, rss) {
      if (err) {
        reject(err);
      }

      const result = await Promise.all(rss.items.map(async (article) => {

        return {
          title: article.title,
          source: article.source,
          description: isCat ? undefined : h2p(article.description).split("\n\n")[1],
          link: article.link,
          image: article.media ? article.media.content[0].url[0] : undefined,
          publishedAt: article.created
        }

      }));

      resolve(result);
    });
  });

}


async function getFeedByTopic(topicId, page = 1) {
  const topic = await Topic.findById(topicId);
  let result;
  const lastRefreshedDate = moment(topic.lastRefreshed);
  const currentRefreshDate = moment();

  try {
    page = parseInt(page);
  }
  catch (e) {
    return e;
  }

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