const { MongoClient, ServerApiVersion } = require('mongodb');
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined.');
} else {
  console.log(`MONGODB_URI: ${uri}`);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db('x-clone');

async function connectToMongoDB() {
  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}
connectToMongoDB().catch(console.dir);

export { client, connectToMongoDB, db };
