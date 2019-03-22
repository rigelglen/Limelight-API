const db = require('core/db');
const Topic = db.Topic;
const User = db.User;
const moment = require('moment');
const newsApiKey = process.env.newsApiKey || require('config.json').newsApiKey;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsApiKey);

module.exports = {
    getFollows,
    addFollow,
    removeFollow,
    getFeed,
    getFeedByTopic,
    getFeedBySearch
};

async function getFollows(uid) {
    const userFollows = await User.findById(uid);

    const topics = await Topic.find({ _id: { $in: userFollows.follows } }).select('-cache');

    return topics;

}

async function addFollow(uid, topicString) {
    const userObj = await User.findById(uid);
    const tp = await Topic.findOne({ name: topicString });
    if (tp) {
        userObj.follows.push(tp._id);
        await userObj.save();
        return tp;
    }

    else {
        const newTopic = new Topic({ name: topicString });
        await newTopic.save();
        const _id = newTopic._id;
        userObj.follows.push(_id);
        await userObj.save();

        return newTopic;
    }

}

async function removeFollow(uid, tid) {
    const userObj = await User.findById(uid);

    if (userObj.follows.indexOf(tid) === -1) {
        return userObj.follows;
    }
    else {
        const index = userObj.follows.indexOf(tid)
        userObj.follows.splice(index, 1);
        await userObj.save();
    }
    return userObj.follows;
}

async function getFeed(uid, page = 1) {
    const userObj = await User.findById(uid);

    const topics = await Topic.find({
        "_id": {
            $in: userObj.follows
        }
    });

    const topicNames = topics.map((topic) => {
        return topic.name;
    });

    let queryString = "";
    let flag = 0;

    topicNames.map((topic) => {
        if (flag == 0) {
            queryString = `${topic}`;
            flag = 1;
        }
        else {
            queryString = `${queryString} OR ${topic}`;
        }
    });
    return await queryNews(queryString, page);

}

async function getFeedByTopic(topicId, page = 1) {
    const topic = await Topic.findById(topicId);
    let result;
    const lastRefreshedDate = moment(topic.lastRefreshed);
    const currentRefreshDate = moment();

    if (lastRefreshedDate.diff(currentRefreshDate, 'hours') > 3 || !topic.cache) {
        result = await queryNews(topic.name, page);
        topic.cache = result;
        topic.lastRefreshed = new Date();

        await topic.save();
    }

    else if (topic.cache) {
        result = topic.cache;
    }
    return result;
}


async function getFeedBySearch(searchString, page = 1) {
    return await queryNews(searchString, page);
}



async function queryNews(queryString, page) {
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
