const mongoose = require('mongoose');

// Define the MongoDB URI
const mongoURI = "mongodb://0.0.0.0:27017/MovieTicketBooking";

// Create a function to connect to MongoDB
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = connectToMongo;