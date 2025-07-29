const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return;
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📍 Connected to: ${mongoose.connection.host}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas whitelist');
      console.log('1. Go to MongoDB Atlas Dashboard');
      console.log('2. Click "Network Access"');
      console.log('3. Click "Add IP Address"');
      console.log('4. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
    }
  }
}

testConnection(); 