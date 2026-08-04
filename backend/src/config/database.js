import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      // Default is 30s, which makes a missing local MongoDB look like a hang
      serverSelectionTimeoutMS: 8000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB connection failed: ${error.message}`);
    console.error(`   URI: ${config.mongodb.uri}`);
    console.error('   The API cannot start without a database. Either:');
    console.error('     • start a local MongoDB (e.g. `docker run -d -p 27017:27017 mongo:7`), or');
    console.error('     • point MONGODB_URI in backend/.env at a MongoDB Atlas cluster\n');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err}`);
});

export default connectDB;
