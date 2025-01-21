const mongoose = require('mongoose');

const blaclistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model('Blacklist', blaclistSchema);