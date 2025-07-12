const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.SKIP_MONGO === 'true') {
      console.log('MongoDB connection skipped for development');
      return;
    }
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('Continuing without MongoDB in development mode');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB; 