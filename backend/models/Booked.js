const mongoose = require('mongoose');

const bookedSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    showTime: {
        type: String, // Change this to String
        required: true
    },
    showDate: {
        type: Date, // Keep this as Date
        required: true
    },
    numberofTickets: {
        type: Number,
        required: true
    },
    bookedOn: {
        type: Date,
        default: Date.now
    }
});

const Booked = mongoose.model('tickets', bookedSchema);
module.exports = Booked;