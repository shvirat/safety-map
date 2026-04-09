import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import newsRoutes from './routes/news.js';


dotenv.config();

connectDB();

const app = express();

// zruri middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://safety-map-beta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);

app.get('/', (req, res) => {
  res.send('SafetyMap API is running...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
