const db = require('_helpers/db');
const Topic = db.Topic;
const User = db.User;

module.exports = {
    getFollows,
    addFollow,
    removeFollow
};

async function getFollows(uid) {
    const userFollows = await User.findById(uid).follows

    const topics = Topic.find({ _id: { $in: userFollows } });

    return topics;
    // Person.
    //     find({
    //         occupation: /host/,
    //         'name.last': 'Ghost',
    //         age: { $gt: 17, $lt: 66 },
    //         likes: { $in: ['vaporizing', 'talking'] }
    //     }).
    //     limit(10).
    //     sort({ occupation: -1 }).
    //     select({ name: 1, occupation: 1 }).
    //     exec(callback);


}

async function addFollow(uid, topicString) {

}

async function removeFollow(uid, tid) {

}


