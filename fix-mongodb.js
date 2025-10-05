#!/usr/bin/env node

// MongoDB Setup Helper for HelpDesk Mini
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 HelpDesk Mini - MongoDB Setup Helper\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('Choose your MongoDB setup option:\n');
  console.log('1. Local MongoDB (recommended for development)');
  console.log('2. MongoDB Atlas (cloud database)');
  console.log('3. Custom connection string\n');
  
  const choice = await question('Enter your choice (1-3): ');
  
  let mongoUri = '';
  
  switch (choice.trim()) {
    case '1':
      mongoUri = 'mongodb://localhost:27017/helpdesk-mini';
      console.log('\n✅ Using local MongoDB');
      console.log('📝 Make sure MongoDB is installed and running locally');
      break;
      
    case '2':
      console.log('\n🌐 Setting up MongoDB Atlas...');
      const username = await question('Enter your Atlas username: ');
      const password = await question('Enter your Atlas password: ');
      const cluster = await question('Enter your cluster URL (e.g., cluster0.xxxxx.mongodb.net): ');
      
      mongoUri = `mongodb+srv://${username}:${password}@${cluster}/helpdesk-mini?retryWrites=true&w=majority`;
      console.log('\n✅ Atlas connection string configured');
      break;
      
    case '3':
      mongoUri = await question('Enter your custom MongoDB URI: ');
      console.log('\n✅ Custom connection string set');
      break;
      
    default:
      console.log('❌ Invalid choice. Exiting...');
      rl.close();
      return;
  }
  
  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Replace or add MONGODB_URI
  if (envContent.includes('MONGODB_URI=')) {
    envContent = envContent.replace(/MONGODB_URI=.*$/m, `MONGODB_URI=${mongoUri}`);
  } else {
    envContent += `\nMONGODB_URI=${mongoUri}\n`;
  }
  
  // Ensure other required variables exist
  if (!envContent.includes('JWT_SECRET=')) {
    envContent += 'JWT_SECRET=helpdesk-mini-super-secret-jwt-key-2024\n';
  }
  
  if (!envContent.includes('PORT=')) {
    envContent += 'PORT=5000\n';
  }
  
  if (!envContent.includes('NODE_ENV=')) {
    envContent += 'NODE_ENV=development\n';
  }
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file updated successfully!');
  console.log('📁 Location:', envPath);
  
  // Test the connection
  const testConnection = await question('\nWould you like to test the connection now? (y/n): ');
  
  if (testConnection.toLowerCase() === 'y') {
    console.log('\n🧪 Testing MongoDB connection...');
    
    try {
      // Set the environment variable for the test
      process.env.MONGODB_URI = mongoUri;
      
      // Run the connection test
      require('./test-mongodb.js');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  } else {
    console.log('\n💡 You can test the connection later with: npm run test-db');
    console.log('🚀 Start your application with: npm run dev');
  }
  
  rl.close();
}

main().catch(console.error);