// server/server.js
import express from 'express';
import cors from 'cors';
import applicationsRoute from './routes/applications.js';
import documentsRoute from './routes/documents.js';
import mlRoute from './routes/ml.js';
import authRoute from './routes/auth.js';

// ✅ 1. Create the app FIRST
const app = express();

// ✅ 2. Configure CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://hirewise-maxxf2.onrender.com",
  "https://hirewise-maxx-git-main-madhabs-projects-e78e2689.vercel.app",
  "https://hiring-portal-mocha.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow listed origins and any vercel.app subdomain
    if (allowedOrigins.indexOf(origin) !== -1 || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ✅ 3. Apply middleware
app.use(express.json());

// ✅ 4. Define routes
app.get("/api", (req, res) => {
  res.json({ users: ["maxx1", "maxx2", "maxx3"] });
});

app.use("/api/applications", applicationsRoute);
app.use("/api/documents", documentsRoute);
app.use("/api/ml", mlRoute);
app.use("/api/auth", authRoute);

// ✅ 5. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});