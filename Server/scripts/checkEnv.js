// checkEnv.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading .env from different locations
const possibleEnvPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '.env'),
  '.env'
];

console.log('Checking for .env files...');
possibleEnvPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    console.log(`✅ Found .env file at: ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.log(`❌ No .env file at: ${envPath}`);
  }
});

console.log('\nEnvironment variables containing "mongo":');
Object.keys(process.env)
  .filter(key => key.toLowerCase().includes('mongo'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });

console.log('\nAll environment variables:');
console.log(Object.keys(process.env).sort());

// Check if we can find a MongoDB URI
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGO_URI || 
                 process.env.DATABASE_URL || 
                 process.env.MONGODB_URL;

if (mongoUri) {
  console.log(`\n✅ Found MongoDB URI: ${mongoUri.substring(0, 20)}...`);
} else {
  console.log('\n❌ No MongoDB URI found in environment variables');
}