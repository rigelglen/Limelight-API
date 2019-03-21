const db = require('_helpers/db');
const Topic = db.Topic;
const User = db.User;
const mongoose = require('mongoose');

module.exports = {
    getFollows,
    addFollow,
    removeFollow
};

async function getFollows(uid) {
    const userFollows = await User.findById(uid);

    const topics = await Topic.find({ _id: { $in: userFollows.follows } });

    return topics;

}

async function addFollow(uid, topicString) {
    const userObj = await User.findById(uid)
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
        await userObj.save()

        return newTopic
    }

}

async function removeFollow(uid, tid) {
    const userObj = await User.findById(uid)

    if (userObj.follows.indexOf(tid) === -1) {
        return userObj.follows
    }
    else {
        const index = userObj.follows.indexOf(tid)
        userObj.follows.splice(index, 1)
        await userObj.save()
    }
    return userObj.follows
}


