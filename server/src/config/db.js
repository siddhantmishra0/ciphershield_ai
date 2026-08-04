import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphershield');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn('   Server will start without database. Some features will be limited.');
    console.warn('   To fix: start MongoDB or set MONGODB_URI in .env to your Atlas URI');
  }
};
