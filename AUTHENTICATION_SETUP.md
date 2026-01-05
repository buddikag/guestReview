# Authentication Setup Guide

This document explains how to set up and use the authentication system for the Guest Review System.

## Database Setup

1. Run the database setup script to create the necessary tables:
   ```sql
   mysql -u root -p < database_setup.sql
   ```

## Initial Super Admin Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the setup script to create the initial super admin user:
   ```bash
   node setup-admin.js
   ```

3. Default credentials:
   - **Username:** `superadmin`
   - **Password:** `admin123`
   
   ⚠️ **IMPORTANT:** Change the default password after first login!

## User Roles

The system supports the following user roles:

- **super_admin**: Full access to all features, including user management
- **admin**: Administrative access (can be customized)
- **manager**: Management level access (can be customized)
- **staff**: Basic staff access (can be customized)

## Features

### Authentication
- User login with username/email and password
- JWT token-based authentication
- Secure password hashing using bcrypt
- Token stored in localStorage

### User Management (Super Admin Only)
- Create new users
- Update user information
- Assign users to hotels
- Set user roles and access levels
- Delete users (soft delete)

### Hotel Management
- Super admin can create, update, and delete hotels
- Users can be assigned to multiple hotels
- Hotel-based access control

### Protected Routes
- All guest management routes require authentication
- User management route requires super admin role
- Automatic redirect to login if not authenticated

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout (client-side token removal)

### User Management (Super Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Hotel Management
- `GET /api/hotels` - Get hotels (all for super admin, assigned for regular users)
- `POST /api/hotels` - Create hotel (super admin only)
- `PUT /api/hotels/:id` - Update hotel (super admin only)
- `DELETE /api/hotels/:id` - Delete hotel (super admin only)

## Frontend Routes

- `/login` - Login page
- `/` - Home (protected)
- `/createGuest` - Add guest (protected)
- `/updateGuest/:guestid` - Update guest (protected)
- `/listfeedback` - List feedback (protected)
- `/users` - User management (super admin only)
- `/simplewtstar/review` - Review page (public, uses token in URL)

## Security Notes

1. Change the JWT_SECRET in production (set via environment variable)
2. Use HTTPS in production
3. Implement rate limiting for login attempts
4. Regularly update dependencies
5. Use strong passwords for all users
6. Implement password reset functionality for production use

