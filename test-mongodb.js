#!/usr/bin/env node

// MongoDB Connection Test Script for HelpDesk Mini
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testing MongoDB Connection...\n');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk-mini';

// Hide credentials in logs
const safeURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log('📍 Testing connection to:', safeURI);
console.log('🔄 Connecting...\n');

// Test connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
})
.then(() => {
  console.log('✅ SUCCESS: MongoDB connected successfully!');
  console.log('📊 Database name:', mongoose.connection.name);
  console.log('🏠 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  console.log('📈 Ready state:', mongoose.connection.readyState);
  
  // Test a simple operation
  console.log('\n🧪 Testing database operations...');
  
  // Create a simple test collection
  const TestSchema = new mongoose.Schema({
    message: String,
    timestamp: { type: Date, default: Date.now }
  });
  
  const Test = mongoose.model('Test', TestSchema);
  
  return Test.create({ message: 'HelpDesk Mini connection test' });
})
.then((doc) => {
  console.log('✅ Database write test successful!');
  console.log('📝 Test document created:', doc._id);
  
  // Clean up test document
  return mongoose.model('Test').deleteOne({ _id: doc._id });
})
.then(() => {
  console.log('🧹 Test document cleaned up');
  console.log('\n🎉 All tests passed! Your MongoDB connection is working perfectly.');
  console.log('💡 You can now start your HelpDesk Mini application.');
  process.exit(0);
})
.catch(err => {
  console.error('\n❌ CONNECTION FAILED:', err.message);
  
  // Provide specific error guidance
  if (err.message.includes('authentication failed')) {
    console.log('\n🔐 AUTHENTICATION ERROR:');
    console.log('   • Check your username and password in the connection string');
    console.log('   • Make sure the user exists in MongoDB Atlas');
    console.log('   • Verify the user has proper permissions');
    console.log('\n💡 Current connection string format should be:');
    console.log('   mongodb+srv://username:password@cluster.mongodb.net/database');
  } else if (err.message.includes('ENOTFOUND') || err.message.includes('timeout')) {
    console.log('\n🌐 NETWORK ERROR:');
    console.log('   • Check your internet connection');
    console.log('   • Verify the cluster URL is correct');
    console.log('   • Check if your IP is whitelisted in MongoDB Atlas');
  } else if (err.message.includes('ECONNREFUSED')) {
    console.log('\n🔌 LOCAL CONNECTION ERROR:');
    console.log('   • Make sure MongoDB is installed and running locally');
    console.log('   • Check if MongoDB service is started');
    console.log('   • Verify port 27017 is available');
  }
  
  console.log('\n🔧 QUICK FIXES:');
  console.log('1. For LOCAL MongoDB:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/helpdesk-mini');
  console.log('\n2. For MongoDB Atlas:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk-mini');
  console.log('\n3. Check MONGODB_SETUP.md for detailed instructions');
  
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  mongoose.connection.close();
  process.exit(0);
});