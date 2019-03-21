const mongoose = require('mongoose');
const db = require('_helpers/db');

const Schema = mongoose.Schema;
const Topic = db.Topic;

const schema = new Schema({
    username: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    createdDate: { type: Date, default: Date.now },
    follows: [{ type: Schema.ObjectId, unique: true }]
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);