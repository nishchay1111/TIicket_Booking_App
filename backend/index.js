const express = require('express');
const cors = require('cors');

const app = express();
const port = 5001;

//
// ✅ 1. CORS CONFIG
//
const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "auth-token"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

//
// ✅ 2. BODY PARSER (CRITICAL)
//
app.use(express.json());

//
// ✅ 3. ROUTES
//
app.use('/api/auth', require('./routes/auth'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/organizers', require('./routes/organizers'));

//
// ✅ 4. ROOT ROUTE
//
app.get('/', (req, res) => {
  res.send('🎟️ Ticket Booking Backend is Running');
});

//
// ✅ 5. GLOBAL ERROR HANDLER
//
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

//
// ✅ 6. START SERVER
//
app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
