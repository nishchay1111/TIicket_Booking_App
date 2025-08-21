const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for showtimes
const showTimeSchema = new Schema({
    time: {
        type: String, // Example: "10:00 AM"
        required: true
    },
    totalTickets: {
        type: Number, // Total number of tickets for this showtime
        required: true
    },
    availableTickets: {
        type: Number, // Remaining tickets for this showtime
        required: true
    }
});

// Define the schema for show dates
const showDateSchema = new Schema({
    date: {
        type: Date, // Specific date for the event
        required: true
    },
    times: [showTimeSchema] // Embed multiple showtimes for this date
});

// Define the main event schema
const eventSchema = new Schema({
    type: {
        type: String, // Example: "Movie", "Concert", "Sports"
        required: true
    },
    eventName: {
        type: String,
        required: true,
        unique: true,
        index: true // Index for faster lookup of events
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizers', // Reference to the 'organizers' collection
        required: true
    },
    image: {
        type: String, // Path to the image stored locally
        required: true // Every event must have an image
    },
    showTimes: [showDateSchema], // Embed multiple show dates
    status: {
        type: Boolean, // Use Boolean instead of Binary for clarity (true = active, false = inactive)
        required: true
    },
    language: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    venue:{
        type: String,
        required: true        
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('events', eventSchema);