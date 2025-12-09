// Quick MongoDB connection test
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const uri = process.env.DATABASE_URL;

console.log('Testing MongoDB connection...');
console.log('Connection string:', uri?.replace(/:[^:@]+@/, ':****@')); // Hide password

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    const db = client.db('fhsu_gamepulse');
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check username/password in MongoDB Atlas');
    console.log('2. Verify IP whitelist (Network Access)');
    console.log('3. Ensure database user has read/write permissions');
  } finally {
    await client.close();
  }
}

testConnection();
