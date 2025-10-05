#!/usr/bin/env node

// Quick MongoDB Connection Fix
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 Quick MongoDB Connection Fix\n');

// Test different connection string formats
const testConnections = [
  // Current format
  'mongodb+srv://aryan:aryanter@cluster0.evvrens.mongodb.net/helpdesk-mini?retryWrites=true&w=majority&appName=Cluster0',
  
  // Without appName
  'mongodb+srv://aryan:aryanter@cluster0.evvrens.mongodb.net/helpdesk-mini?retryWrites=true&w=majority',
  
  // Minimal format
  'mongodb+srv://aryan:aryanter@cluster0.evvrens.mongodb.net/helpdesk-mini',
  
  // Local fallback
  'mongodb://localhost:27017/helpdesk-mini'
];

async function testConnection(uri, index) {
  console.log(`\n🧪 Test ${index + 1}: Testing connection...`);
  console.log(`📍 URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ SUCCESS! This connection works.');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    
    // Update .env file with working URI
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/MONGODB_URI=.*$/m, `MONGODB_URI=${uri}`);
    fs.writeFileSync(envPath, envContent);
    
    console.log('💾 Updated .env file with working connection string');
    console.log('\n🎉 You can now start your server with: npm run dev');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

async function main() {
  for (let i = 0; i < testConnections.length; i++) {
    const success = await testConnection(testConnections[i], i);
    if (success) break;
    
    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('\n🔧 Possible solutions:');
  console.log('1. Check your MongoDB Atlas credentials');
  console.log('2. Verify your cluster URL is correct');
  console.log('3. Make sure your IP is whitelisted in Atlas');
  console.log('4. Try using local MongoDB instead');
  console.log('\n💡 For local MongoDB, use:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/helpdesk-mini');
  
  process.exit(1);
}

main().catch(console.error);