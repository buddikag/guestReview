# Widget API Usage Guide

## Overview
The widget API provides endpoints to fetch guest reviews for a specific hotel. This is designed for public widgets that can be embedded on hotel websites.

## Endpoints

### 1. Get Reviews by Hotel ID (Simple Method)
**Endpoint:** `GET /simplewtstar/hotel/:hotelId`

**Parameters:**
- `hotelId` (URL parameter): The ID of the hotel
- `page` (query parameter, optional): Page number (default: 1)
- `limit` (query parameter, optional): Number of reviews per page (default: 10)

**Example Request:**
```javascript
// Fetch first 10 reviews for hotel ID 1
GET http://your-api-url/simplewtstar/hotel/1

// Fetch reviews with pagination
GET http://your-api-url/simplewtstar/hotel/1?page=2&limit=20
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Great hotel with excellent service!",
      "nickname": "John D.",
      "reply": "Thank you for your feedback!",
      "state": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "hotel_id": 1,
      "hotel_name": "Grand Hotel"
    }
  ],
  "totalRecords": 25,
  "totalPages": 3,
  "currentPage": 1,
  "limit": 10
}
```

### 2. Get Reviews by Token (Secure Method)
**Endpoint:** `GET /simplewtstar/hotel-token/:token`

**Parameters:**
- `token` (URL parameter): JWT token containing hotel_id (generated via `/simplewtstar/generateReviewToken`)
- `page` (query parameter, optional): Page number (default: 1)
- `limit` (query parameter, optional): Number of reviews per page (default: 10)

**Example Request:**
```javascript
// Using token generated from /simplewtstar/generateReviewToken
GET http://your-api-url/simplewtstar/hotel-token/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Frontend Widget Usage

### Method 1: Using Hotel ID (Direct)
```javascript
import axios from 'axios';

// Option 1: Get hotelId from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const hotelId = urlParams.get('hotelId') || 1; // default to 1

// Option 2: Get from environment variable
// Set VITE_HOTEL_ID=1 in your .env file
const hotelId = import.meta.env.VITE_HOTEL_ID || 1;

// Fetch reviews
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const response = await axios.get(`${apiUrl}/simplewtstar/hotel/${hotelId}?page=1&limit=10`);

const reviews = response.data.data;
```

### Method 2: Using Token (More Secure)
```javascript
import axios from 'axios';

// First, generate a token using the API endpoint
// POST /simplewtstar/generateReviewToken
// Body: { userId: 1, hotelId: 1 }
const response = await axios.post(
  `${apiUrl}/simplewtstar/generateReviewToken`,
  { userId: 1, hotelId: 1 }
);
const token = response.data; // Returns token string

// Or use an existing token
const token = 'your-jwt-token-here';

// Fetch reviews using token
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const response = await axios.get(`${apiUrl}/simplewtstar/hotel-token/${token}?page=1&limit=10`);

const reviews = response.data.data;
```

**See `TOKEN_GENERATION_GUIDE.md` for detailed token generation instructions.**

### Complete Widget Example (React)
```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewWidget = ({ hotelId, apiUrl }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchReviews();
  }, [hotelId, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const cleanApiUrl = apiUrl?.replace(/\/$/, '') || '';
      const response = await axios.get(
        `${cleanApiUrl}/simplewtstar/hotel/${hotelId}?page=${pagination.page}&limit=${pagination.limit}`
      );
      
      setReviews(response.data.data);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalRecords: response.data.totalRecords
      });
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="reviews-widget">
      <h3>Guest Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        <>
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span>{review.nickname || review.guest_name}</span>
                <span>{'⭐'.repeat(review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              {review.reply && (
                <div className="reply">
                  <strong>Response:</strong> {review.reply}
                </div>
              )}
              <small>{new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button 
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewWidget;
```

## Usage in HTML Widget
```html
<!DOCTYPE html>
<html>
<head>
  <title>Hotel Reviews Widget</title>
</head>
<body>
  <div id="hotel-reviews-widget"></div>
  
  <script>
    // Get hotel ID from URL parameter or set default
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('hotelId') || 1;
    const apiUrl = 'http://your-api-url'; // Replace with your API URL
    
    // Fetch reviews
    fetch(`${apiUrl}/simplewtstar/hotel/${hotelId}?page=1&limit=10`)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('hotel-reviews-widget');
        container.innerHTML = data.data.map(review => `
          <div class="review-card">
            <h4>${review.nickname || review.guest_name}</h4>
            <div>${'⭐'.repeat(review.rating)}</div>
            <p>${review.comment}</p>
            ${review.reply ? `<div class="reply">Response: ${review.reply}</div>` : ''}
            <small>${new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        `).join('');
      })
      .catch(error => {
        console.error('Error loading reviews:', error);
        document.getElementById('hotel-reviews-widget').innerHTML = 
          '<p>Unable to load reviews at this time.</p>';
      });
  </script>
</body>
</html>
```

## Notes

1. **Authentication**: Both endpoints are public and don't require authentication, making them suitable for widgets.

2. **Pagination**: Use the `page` and `limit` query parameters to paginate through reviews.

3. **Security**: If you need more security, use the token-based endpoint. Generate tokens using the `/simplewtstar/generateReviewToken` endpoint.

4. **CORS**: Make sure your backend CORS settings allow requests from your widget's domain.

5. **Error Handling**: Always handle errors gracefully in your widget to provide a good user experience.

6. **Caching**: Consider implementing caching on the client side to reduce API calls.

