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
const addMeta = process.env.ADD_META === 'true';
const isScrape = process.env.SCRAPE === 'true'
const facebookKey = process.env.FACEBOOK_KEY;
const axios = require('axios');
const { setRedis, getRedis } = require('../../core/db');

const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-publisher')(),
]);

const got = require('got');


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

  if (addMeta) {
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

  console.log(`Diff greater than 30mins => ${currentRefreshDate.diff(lastRefreshedDate, 'minutes') > 30}`)

  if ((currentRefreshDate.diff(lastRefreshedDate, 'minutes') > 30 || !topic.cache)) {
    // When cache is invalid 

    let resultData = await queryNews(topic.name, topic.isCat);

    if (gNews) {
      if (addMeta) {
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

    if (!gNews || !addMeta) {
      result = paginate(resultData, page);
    }

    if (!addMeta) {
      topic.cache = resultData;
      topic.lastRefreshed = new Date();
      await topic.save();
    }

  }

  else if (topic.cache) {
    console.log("From cache");
    result = paginate(topic.cache, page);
  }

  return result;
}

async function getFeedBySearch(searchString, page = 1) {
  let result = await queryNews(searchString);
  if (addMeta)
    return await addMetaData(paginate(result, page));
  else
    return await paginate(result, page);
}

async function addMetaData(articles) {
  if (isScrape) {
    return await addMetaDataScrape(articles);
  } else {
    return await addMetaDataFB(articles);
  }
}

async function addMetaDataScrape(articles) {
  return await Promise.all(articles.map(async (article) => {
    if (article.image == undefined) {
      try {
        let res = await getRedis(article.link);
        res = JSON.parse(res);
        if (!res) {
          throw 'Not found in redis';
        }
        console.log("Found in redis")
        article.image = article.image ? article.image : res.image;
        article.title = res.title;
        article.description = res.description;
        article.source = res.source;
      } catch (e) {
        console.log(`Not found on redis`);
        try {
          const response = await axios.get(article.link, { timeout: 3000 });
          const html = response.data;
          const url = response.request.res.req.agent.protocol + "//" + response.request.res.connection._host + response.request.path;
          const metaData = await metascraper({ html, url });
          // console.log(metaData)
          console.log('did not timeout => ' + article.link);
          article.title = article.title != undefined ? article.title : (metaData.title ? metaData.image : undefined);
          article.description = metaData.description != undefined ? metaData.description : undefined;
          article.source = article.source != undefined ? article.source : (metaData.source ? metaData.source : undefined);
          article.image = article.image != undefined ? article.image : (metaData.image ? metaData.image : undefined);
        }
        catch (e) {
          console.log('timeout => ' + article.link)
          return article;
        } finally {
          await setRedis(article.link, JSON.stringify({ ...article }), 'EX', 3 * 60 * 60);
        }
      }
    }
    article.title = article.title.substring(0, article.title.lastIndexOf(" - "));
    return article;
  }));

}


async function addMetaDataFB(articles) {
  let imgUrl;
  return await Promise.all(articles.map(async (article) => {
    let url = article.link;
    try {
      let res = await getRedis(url);
      res = JSON.parse(res);
      if (!res) {
        throw 'Not found'
      }
      console.log(`Found ${url}  on redis!`);
      article.image = article.image ? article.image : res.image;
      article.title = res.title;
      article.description = res.description;
      article.source = res.source;
    } catch (e) {
      try {
        console.log(`Not found on redis! ${url}`);
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