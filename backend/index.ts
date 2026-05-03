import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
// Import routes at the top (Professional Standard)
import authRoutes from './routes/auth';
import bookingRoutes from './routes/booking';
import adminRoutes from './routes/admin';
import organizerRoutes from './routes/organizers';
import cookieParser from 'cookie-parser';

const app = express();
const port: number = 5001;

// ✅ 1. PROXY SETTING (Required for 'req.secure' and 'x-forwarded-proto' to work)
app.set('trust proxy', true);
app.use(cookieParser())

// ✅ 2. FORCE HTTPS MIDDLEWARE
const forceHttps = (req: Request, res: Response, next: NextFunction) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (!isHttps && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

app.use(forceHttps);

// ✅ 3. CORS CONFIG (Typed)
const corsOptions: CorsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "auth-token"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ 4. BODY PARSER
app.use(express.json());

// ✅ 5. ROUTES 
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizers', organizerRoutes);

// ✅ 6. ROOT ROUTE
app.get('/', (req: Request, res: Response) => {
  res.send('🎟️ Ticket Booking Backend is Running');
});

// ✅ 7. GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ 8. START SERVER
app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});