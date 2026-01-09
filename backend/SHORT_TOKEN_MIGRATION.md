# Short Token Migration Guide

## Overview
The token system has been updated to use short tokens (10-20 characters) instead of long JWT tokens. This makes tokens more user-friendly and easier to share.

## What Changed

### Before
- Tokens were JWT tokens (200+ characters)
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJob3RlbF9pZCI6MSwiaWF0IjoxNzA1MzI0MDAwLCJleHAiOjE3MDU5Mjg4MDB9.xxxxx`

### After
- Tokens are now short (15 characters by default)
- Example: `aB3dEf9GhIj2KlMn`

## Database Migration

### Step 1: Run the Migration Script
```bash
mysql -u your_username -p gss < backend/migrations/add_review_tokens_table.sql
```

Or run it directly in MySQL:
```sql
USE gss;
SOURCE backend/migrations/add_review_tokens_table.sql;
```

### Step 2: Verify Table Creation
```sql
SHOW TABLES LIKE 'review_tokens';
DESCRIBE review_tokens;
```

## How It Works

1. **Token Generation**: When a token is generated, it creates a unique 15-character string and stores it in the `review_tokens` table with:
   - `user_id`: The guest/user ID
   - `hotel_id`: The hotel ID
   - `expires_at`: Expiration timestamp
   - `status`: Active (1) or inactive (0)

2. **Token Validation**: When a token is used, the system:
   - Looks up the token in the database
   - Checks if it's expired
   - Checks if it's active
   - Returns the associated user_id and hotel_id

3. **Backward Compatibility**: The system still supports old JWT tokens for backward compatibility. If a token is longer than 20 characters, it's treated as a JWT token.

## Token Expiration

- **Review Tokens**: 7 days (generated via `/generateReviewToken`)
- **Widget Tokens**: 1 year (generated via `/generateWidgetToken`)

## Cleanup

Expired tokens can be cleaned up periodically:

```sql
-- Delete expired tokens
DELETE FROM review_tokens WHERE expires_at < NOW() AND status = 1;
```

You can set up a cron job or scheduled task to run this periodically.

## API Endpoints

All existing endpoints work the same way, but now return short tokens:

### Generate Review Token
```bash
POST /simplewtstar/generateReviewToken
Body: { "userId": 1, "hotelId": 1 }
Response: "aB3dEf9GhIj2KlMn"  # Short token (15 chars)
```

### Generate Widget Token
```bash
POST /simplewtstar/generateWidgetToken
Headers: { "Authorization": "Bearer <token>" }
Body: { "hotelId": 1 }
Response: { "token": "aB3dEf9GhIj2KlMn", ... }
```

### Validate Token
```bash
GET /simplewtstar/getUserData/:token
Response: { "user_id": 1, "hotel_id": 1 }
```

## Benefits

1. **Shorter URLs**: Feedback links are much shorter and easier to share
2. **Better UX**: Users can easily see and verify tokens
3. **Database Tracking**: All tokens are tracked in the database
4. **Expiration Management**: Easy to manage token expiration
5. **Security**: Tokens can be deactivated without affecting other tokens

## Testing

After migration, test the following:

1. Generate a new review token
2. Verify it's 15 characters long
3. Use the token to access the review page
4. Verify token validation works
5. Test token expiration

## Rollback

If you need to rollback to JWT tokens, you can:
1. Keep the `review_tokens` table (it won't interfere)
2. The system will automatically use JWT tokens if tokens are longer than 20 characters
3. No code changes needed for rollback
