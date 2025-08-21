const mongoose = require('mongoose');

// Define a schema using mongoose.Schema
const organizerSchema = new mongoose.Schema({
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
        // No default here; expect password to be explicitly set and securely handled
    },
    verified: {
        type: Number, // Use Buffer for binary data
        default: 0 // Default value is a placeholder, but this can be changed based on your logic
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Corrected model name and typo in model registration
const Organizers = mongoose.model('organizers', organizerSchema);

// Uncomment to enforce index creation (if necessary)
// Organizers.createIndexes();

module.exports = Organizers;
