const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI not set');
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connection established to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection disconnected');
    });

    await mongoose.connect(uri);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error.message);
    throw error;
  }
};

const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(`Mongoose connection closed through app termination (${signal})`);
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
