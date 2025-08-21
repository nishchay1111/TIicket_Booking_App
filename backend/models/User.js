const mongoose = require('mongoose');

// Define a schema using mongoose.Schema


const userStructure = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('users', userStructure);
// User.createIndexes();
module.exports = User;
