# Backend Scripts

## Available Scripts

### Generate Widget Token

Generate a JWT token for hotel review widgets.

**Usage:**
```bash
# Using npm script
npm run generate-token [userId] [hotelId]

# Direct execution
node scripts/generate-token.js [userId] [hotelId]
```

**Examples:**
```bash
# Generate token for userId=1, hotelId=1 (default)
npm run generate-token

# Generate token for specific userId and hotelId
npm run generate-token 1 2

# Using node directly
node scripts/generate-token.js 1 2
```

**Output:**
The script will output:
- The generated JWT token
- Usage instructions for the widget
- Token expiration information (7 days)

**Example Output:**
```
═══════════════════════════════════════════════════
   Hotel Review Widget Token Generator
═══════════════════════════════════════════════════

User ID:     1
Hotel ID:    2
Expires in: 7 days

Generated Token:
───────────────────────────────────────────────────
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
───────────────────────────────────────────────────

Usage in Widget:
GET /simplewtstar/hotel-token/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Or use it directly in your widget:
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const apiUrl = 'http://your-api-url';
fetch(`\${apiUrl}/simplewtstar/hotel-token/\${token}?page=1&limit=10`)

═══════════════════════════════════════════════════
```

