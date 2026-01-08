import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'gss_2026_@';

function generateToken(userId, hotelId) {
  const token = jwt.sign(
    { 
      user_id: userId, 
      hotel_id: hotelId 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
  return token;
}

// Get command line arguments
const args = process.argv.slice(2);
const userId = parseInt(args[0]) || 1;
const hotelId = parseInt(args[1]) || 1;

if (args.length === 0) {
  console.log('\nUsage: node generate-token.js [userId] [hotelId]');
  console.log('Example: node generate-token.js 1 1');
  console.log('Default: userId=1, hotelId=1\n');
}

const token = generateToken(userId, hotelId);

console.log('\n═══════════════════════════════════════════════════');
console.log('   Hotel Review Widget Token Generator');
console.log('═══════════════════════════════════════════════════\n');
console.log('User ID:    ', userId);
console.log('Hotel ID:   ', hotelId);
console.log('Expires in: 7 days');
console.log('\nGenerated Token:');
console.log('───────────────────────────────────────────────────');
console.log(token);
console.log('───────────────────────────────────────────────────\n');
console.log('Usage in Widget:');
console.log(`GET /simplewtstar/hotel-token/${token}`);
console.log('\nOr use it directly in your widget:');
console.log(`const token = '${token}';`);
console.log(`const apiUrl = 'http://your-api-url';`);
console.log(`fetch(\`\${apiUrl}/simplewtstar/hotel-token/\${token}?page=1&limit=10\`)`);
console.log('\n═══════════════════════════════════════════════════\n');

