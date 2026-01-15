const express = require('express');
const cors = require('cors');
const path = require('path'); // Required for handling file paths on Mac

const app = express();
const port = 5001;

// 1. Middleware
app.use(cors({
  origin: 'http://localhost:3000' // Matches your React frontend
}));
app.use(express.json()); // Essential for reading req.body

// 2. Available Routes
// Ensure these files exist in your 'routes' folder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/organizers', require('./routes/organizers'));

// 3. Root Route (Optional - helps verify the server is running)
app.get('/', (req, res) => {
  res.send('Ticket Booking Backend is Running');
});

// 4. Start Server
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});