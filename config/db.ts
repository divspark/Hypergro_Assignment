// db.ts
import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/property-listing';

export const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',  
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

// Handle Redis errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Ensure Redis connection only once
let isRedisConnected = false;

export const connectRedis = async () => {
  try {
    if (!isRedisConnected && !redisClient.isOpen) {
      await redisClient.connect();
      isRedisConnected = true;
      console.log('Redis connected');
    }
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
