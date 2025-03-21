const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.SKIP_MONGO === 'true') {
      console.log('MongoDB connection skipped for development');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
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