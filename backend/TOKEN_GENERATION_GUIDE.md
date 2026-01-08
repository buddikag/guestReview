# Token Generation Guide

## Overview
Tokens are JWT (JSON Web Tokens) that contain hotel and user information. They can be used to securely access hotel-specific reviews without exposing the hotel ID in the URL.

## Existing API Endpoint

### Generate Review Token
**Endpoint:** `POST /simplewtstar/generateReviewToken`

**Request Body:**
```json
{
  "userId": 1,
  "hotelId": 1
}
```

**Response:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJob3RlbF9pZCI6MSwiaWF0IjoxNzA1MzI0MDAwLCJleHAiOjE3MDU5Mjg4MDB9.xxxxx"
```

**Token Expiration:** 7 days

## Methods to Generate Tokens

### Method 1: Using API Endpoint (cURL)

```bash
# Replace userId and hotelId with actual values
curl -X POST http://localhost:3000/simplewtstar/generateReviewToken \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "hotelId": 1}'
```

### Method 2: Using API Endpoint (JavaScript/Node.js)

```javascript
import axios from 'axios';

async function generateToken(userId, hotelId) {
  try {
    const response = await axios.post(
      'http://localhost:3000/simplewtstar/generateReviewToken',
      {
        userId: userId,
        hotelId: hotelId
      }
    );
    return response.data; // Returns the token string
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

// Usage
const token = await generateToken(1, 1);
console.log('Generated token:', token);
```

### Method 3: Using API Endpoint (React/Next.js)

```javascript
// In your admin panel or hotel management page
const generateHotelWidgetToken = async (hotelId) => {
  try {
    const response = await fetch('http://localhost:3000/simplewtstar/generateReviewToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if needed
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        userId: currentUser.id,
        hotelId: hotelId
      })
    });
    
    const token = await response.json();
    return token;
  } catch (error) {
    console.error('Failed to generate token:', error);
    return null;
  }
};

// Usage in a React component
const HotelWidgetTokenGenerator = () => {
  const [token, setToken] = useState(null);
  const [hotelId, setHotelId] = useState(1);

  const handleGenerate = async () => {
    const newToken = await generateHotelWidgetToken(hotelId);
    setToken(newToken);
  };

  return (
    <div>
      <input 
        type="number" 
        value={hotelId} 
        onChange={(e) => setHotelId(e.target.value)}
        placeholder="Hotel ID"
      />
      <button onClick={handleGenerate}>Generate Token</button>
      {token && (
        <div>
          <p>Token: {token}</p>
          <button onClick={() => navigator.clipboard.writeText(token)}>
            Copy Token
          </button>
        </div>
      )}
    </div>
  );
};
```

### Method 4: Direct Token Generation (Node.js Script)

Create a standalone script to generate tokens:

```javascript
// generate-token.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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
const userId = parseInt(process.argv[2]) || 1;
const hotelId = parseInt(process.argv[3]) || 1;

const token = generateToken(userId, hotelId);
console.log('\nGenerated Token:');
console.log(token);
console.log('\nTo use in widget:');
console.log(`GET /simplewtstar/hotel-token/${token}`);
console.log('\nToken expires in 7 days');
```

**Usage:**
```bash
node generate-token.js 1 1
# Generates token for userId=1, hotelId=1
```

### Method 5: Using PHP

```php
<?php
// generate-token.php
function generateReviewToken($userId, $hotelId) {
    $apiUrl = 'http://localhost:3000/simplewtstar/generateReviewToken';
    
    $data = json_encode([
        'userId' => $userId,
        'hotelId' => $hotelId
    ]);
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data)
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$token = generateReviewToken(1, 1);
echo "Token: " . $token;
?>
```

### Method 6: Using Python

```python
# generate_token.py
import requests
import json

def generate_review_token(user_id, hotel_id, api_url='http://localhost:3000'):
    url = f"{api_url}/simplewtstar/generateReviewToken"
    payload = {
        "userId": user_id,
        "hotelId": hotel_id
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.text.strip('"')  # Remove quotes from JSON string
    else:
        raise Exception(f"Failed to generate token: {response.status_code}")

# Usage
if __name__ == "__main__":
    import sys
    user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    hotel_id = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    
    token = generate_review_token(user_id, hotel_id)
    print(f"\nGenerated Token: {token}")
    print(f"\nTo use in widget:")
    print(f"GET /simplewtstar/hotel-token/{token}")
```

**Usage:**
```bash
python generate_token.py 1 1
```

## Using Generated Tokens

### In Widget (JavaScript)
```javascript
const token = 'your-generated-token-here';
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

// Fetch reviews using token
const response = await axios.get(
  `${apiUrl}/simplewtstar/hotel-token/${token}?page=1&limit=10`
);

const reviews = response.data.data;
```

### In Widget (HTML)
```html
<script>
  const token = 'your-generated-token-here';
  const apiUrl = 'http://your-api-url';
  
  fetch(`${apiUrl}/simplewtstar/hotel-token/${token}?page=1&limit=10`)
    .then(response => response.json())
    .then(data => {
      console.log('Reviews:', data.data);
      // Display reviews
    })
    .catch(error => console.error('Error:', error));
</script>
```

## Token Verification

### Verify Token (Decode)
Use the existing endpoint to verify/decode a token:

```bash
GET /simplewtstar/getUserData/:token
```

**Example:**
```javascript
const token = 'your-token-here';
const response = await axios.get(
  `http://localhost:3000/simplewtstar/getUserData/${token}`
);

console.log(response.data);
// { user_id: 1, hotel_id: 1, iat: 1705324000, exp: 1705928800 }
```

### Manual Verification (JavaScript)
```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-jwt-secret';

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

const token = 'your-token-here';
const decoded = verifyToken(token);
console.log('Decoded token:', decoded);
// { user_id: 1, hotel_id: 1, iat: 1705324000, exp: 1705928800 }
```

## Best Practices

1. **Security**: Generate tokens server-side or in a secure admin panel, never expose the JWT_SECRET
2. **Storage**: Store tokens securely if you need to reuse them
3. **Expiration**: Tokens expire in 7 days - regenerate if needed
4. **Scope**: Each token is specific to one hotel
5. **Regeneration**: Generate new tokens periodically for security

## Integration in Admin Panel

Here's an example of integrating token generation into your hotel management interface:

```jsx
// In your HotelManagement.jsx component
import { useState } from 'react';
import axios from 'axios';

const HotelTokenGenerator = ({ hotelId }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/simplewtstar/generateReviewToken`,
        {
          userId: currentUser.id,
          hotelId: hotelId
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      setToken(response.data);
    } catch (error) {
      console.error('Failed to generate token:', error);
      alert('Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-generator">
      <h4>Widget Token</h4>
      {token ? (
        <div>
          <textarea readOnly value={token} rows="3" style={{ width: '100%' }} />
          <button onClick={() => navigator.clipboard.writeText(token)}>
            Copy Token
          </button>
          <p>
            <small>
              Use this token in your widget URL:<br />
              <code>{`${API_URL}/simplewtstar/hotel-token/${token}`}</code>
            </small>
          </p>
        </div>
      ) : (
        <button onClick={generateToken} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Widget Token'}
        </button>
      )}
    </div>
  );
};
```

## Troubleshooting

### Token Invalid/Expired
- Check if token has expired (7 days)
- Verify JWT_SECRET matches between generation and verification
- Regenerate a new token

### Hotel ID Not Found
- Verify the hotelId exists in the database
- Check token payload contains correct hotel_id

### CORS Issues
- Ensure CORS is configured in your backend
- Check if widget domain is allowed in CORS settings

