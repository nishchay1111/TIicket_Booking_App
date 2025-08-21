const mongoose = require('mongoose');

// Define a schema using mongoose.Schema


const adminSchema = new mongoose.Schema({
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

const Admin = mongoose.model('admin', adminSchema);
// User.createIndexes();
module.exports = Admin;
