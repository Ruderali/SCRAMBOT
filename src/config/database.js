const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'scramDb', // Specify the database
    });
    console.log('MongoDB connected successfully to scramDb');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// Function to disconnect from the database
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
  }
};

// Create a database context object to export
const db = {
  connect: connectDB,
  disconnect: disconnectDB,
};

module.exports = db;
