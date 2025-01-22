const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    otp: {
        type: String,
        required: true
    },
    timestamps:{
        type:Date,
        default:Date.now(),
        required:true,
        get:timestamps => timestamps.getTime(),
        set:timestamps => new Date(timestamps)
    }
});

module.exports = mongoose.model('Otp', otpSchema);