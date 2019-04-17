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
const gNews = process.env.GNEWS === 'true';
const fbThumb = process.env.FB_THUMB === 'true';
const facebookKey = process.env.FACEBOOK_KEY;
const axios = require('axios');
const grabity = require('grabity');
const { setRedis, getRedis } = require('../../core/db');

module.exports = {
  getFeed,
  getFeedByTopic,
  getFeedBySearch,
  getFeedByCategory
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

  let result = await queryNews(queryString);

  if (fbThumb) {
    return await addMetaData(paginate(result, page));
  }
  return await paginate(result, page);

}

async function queryNews(queryString, isCat = false) {
  if (gNews) {
    return await queryGNews(queryString, isCat);
  }
  else {
    return await queryNewsApi(queryString);
  }
}

async function getFeedByCategory(uid, categoryName, page) {
  categoryName = categoryName.trim().toLowerCase();

  let tp = Topic.findOne({ name: categoryName });
  let userObj = User.findById(uid);

  let isFollow = false;

  [userObj, tp] = await Promise.all([userObj, tp]);

  let news = []

  if (tp) {

    news = await getFeedByTopic(tp, page);

    if (userObj.follows.indexOf(tp._id) !== -1) {
      isFollow = true;
    }
  }

  if (news.length && tp) {
    return { isFollow, id: tp._id, articles: news };
  }
  else
    throw 'Invalid category';
}


async function queryNewsApi(queryString) {
  try {
    const response = await newsapi.v2.everything({
      q: queryString,
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 100,
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
  } catch (e) {
    console.log(e);
    return [];
  }
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

  if (((currentRefreshDate.diff(lastRefreshedDate, 'minutes') > 30 || !topic.cache))) {
    // When cache is invalid 

    let resultData = await queryNews(topic.name, topic.isCat);

    if (gNews) {
      if (fbThumb) {
        // Add metadata to the paginated results that are requested
        result = await addMetaData(paginate(resultData, page));

        // Add metadata later on to all the returned artiles
        addMetaData(resultData).then((res) => {
          topic.cache = res;
          topic.lastRefreshed = new Date();
          topic.save();
        }).then(() => {
          console.log("Save completed");
        }).catch(e => {
          console.log("Failure in adding thumbs");
        });

      }
    }

    if (!gNews || !fbThumb) {
      result = paginate(resultData, page);
    }

    if (!fbThumb) {
      topic.cache = resultData;
      topic.lastRefreshed = new Date();
      await topic.save();
    }

  }

  else if (topic.cache) {
    result = paginate(topic.cache, page);
  }

  return result;
}

async function getFeedBySearch(searchString, page = 1) {
  let result = await queryNews(searchString);
  if (fbThumb)
    return await addMetaData(paginate(result, page));
  else
    return await paginate(result, page);
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
    let url = article.link;
    try {
      let res = await getRedis(url);
      res = JSON.parse(res);
      if (!res) {
        throw 'Not found'
      }
      // console.log(`Found ${url}  on redis!`);
      article.image = article.image ? article.image : res.image;
      article.title = res.title;
      article.description = res.description;
      article.source = res.source;
    } catch (e) {
      try {
        // console.log(`Not found on redis! ${url}`);
        const response = await axios.post(`https://graph.facebook.com/v3.2/?id=${url}&access_token=${facebookKey}`);
        imgUrl = response.data.image[0].secure_url ? response.data.image[0].secure_url : response.data.image[0].url;
        article.title = response.data.title;
        article.description = response.data.description;
        article.source = response.data.site_name;
        article.image = article.image ? article.image : imgUrl;
      } catch (err) {
        return article;
      } finally {
        await setRedis(url, JSON.stringify({ ...article }), 'EX', 3 * 60 * 60);
      }
    }

    return article;
  }));
}


function paginate(data, page) {
  const startIndex = (page - 1) * numArticles;
  const endIndex = page * numArticles;
  try {
    if (endIndex < data.length)
      data = data.slice(startIndex, endIndex);
    else
      data = data.slice(startIndex, data.length - 1);
  } catch (error) {
    return [];
  }
  return data;
}