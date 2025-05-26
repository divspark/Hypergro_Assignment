import express from 'express';
import cors from 'cors';
import { connectDB, connectRedis } from './config/db';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import favoriteRoutes from './routes/favouriteRoutes';
import recommendationRoutes from './routes/recommendationRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/api', (req, res) => {
    res.send('Property Listing API on Vercel');
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
