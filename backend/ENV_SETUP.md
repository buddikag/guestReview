# Environment Variables Setup

## Setup Instructions

1. Create a `.env` file in the `backend` directory with the following content:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=gss_new

# JWT Secret Key
JWT_SECRET=gss_2026_secret_key_change_in_production

# Server Port
PORT=3000

# Frontend Base URL (should match frontend's VITE_BASE_URL)
FRONTEND_BASE_URL=http://localhost:5173
```

2. Update the values according to your MySQL configuration:
   - `DB_HOST`: Your MySQL server host (default: localhost)
   - `DB_USER`: Your MySQL username (default: root)
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: Your database name (default: gss_new)
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `PORT`: Server port (default: 3000)
   - `FRONTEND_BASE_URL`: Frontend base URL (should match `VITE_BASE_URL` in frontend `.env`)

3. The `.env` file is already in `.gitignore` so it won't be committed to version control.

## Example .env file

For local development with default settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gss_new
JWT_SECRET=gss_2026_secret_key_change_in_production
PORT=3000
FRONTEND_BASE_URL=http://localhost:5173
```

**Important:** The `FRONTEND_BASE_URL` should match the `VITE_BASE_URL` value in your frontend `.env` file. This ensures that feedback links in emails point to the correct frontend URL.

For production, use strong passwords and secure JWT secret!

