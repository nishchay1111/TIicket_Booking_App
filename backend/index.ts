import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';

const app = express();
const port: number = 5001;

// ✅ 1. CORS CONFIG (Typed)
const corsOptions: CorsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "auth-token"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ 2. BODY PARSER
app.use(express.json());

// ✅ 3. ROUTES 
// Note: In TS, you usually 'import' these at the top. 
// If your routes aren't TS yet, you can still use require() 
// but 'import' is the professional standard.
import authRoutes from './routes/auth';
import bookingRoutes from './routes/booking';
import adminRoutes from './routes/admin';
import organizerRoutes from './routes/organizers';

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizers', organizerRoutes);

// ✅ 4. ROOT ROUTE (Typed Params)
app.get('/', (req: Request, res: Response) => {
  res.send('🎟️ Ticket Booking Backend is Running');
});

// ✅ 5. GLOBAL ERROR HANDLER (Typed Middleware)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ 6. START SERVER
app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});