const db = require('./../../core/db');
const Topic = db.Topic;
const User = db.User;


module.exports = {
    getFollows,
    addFollow,
    removeFollow
};

async function getFollows(uid) {
    const userFollows = await User.findById(uid);
    return await Topic.find({ _id: { $in: userFollows.follows } }).select('-cache');
}

async function addFollow(uid, topicString) {
    topicString = topicString.trim().toLowerCase();
    let userObj = User.findById(uid);
    let tp = Topic.findOne({ name: topicString });

    [userObj, tp] = await Promise.all([userObj, tp]);

    if (tp) {
        if (userObj.follows.indexOf(tp._id) !== -1) {
            throw `Topic '${topicString}' is already followed`
        }
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
        throw 'You are not following this topic';
    }
    else {
        const index = userObj.follows.indexOf(tid)
        userObj.follows.splice(index, 1);
        await userObj.save();
    }
    return { deletedFollow: tid, currentFollows: userObj.follows };
}
