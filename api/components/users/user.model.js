const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    createdDate: { type: Date, default: Date.now },
    follows: [{ type: Schema.ObjectId }]
});

schema.pre('save', function (next) {
    const sample = this;
    sample.follows = _.uniq(sample.follows, function (i) { return (i._id) ? i._id.toString() : i; });
    next();
});

// schema.plugin(uniqueArrayPlugin);

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);