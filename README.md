# Guest Review System

A full-stack application for hotels to publish guest reviews on their website.

## Project Structure

- **Backend**: Node.js/Express server with MySQL database
- **Frontend**: React application with Vite

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (XAMPP or standalone MySQL)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Make sure MySQL is running (if using XAMPP, start MySQL from the XAMPP Control Panel)
2. Open MySQL (phpMyAdmin or MySQL command line)
3. Import the database schema:
   ```sql
   source database_setup.sql
   ```
   Or manually run the SQL commands from `database_setup.sql`

The database configuration in `backend/server.js`:
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `gss`

If you need to change these settings, edit `backend/server.js` and `backend/simpleWtStar.js`.

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Run the Application

**Start Backend Server (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

**Start Frontend Server (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### Guest Management
- `GET /` - Get all guests (with pagination)
- `GET /getGuest/:id` - Get a specific guest
- `POST /add` - Add a new guest
- `PUT /update/:id` - Update a guest
- `PUT /delete/:id` - Delete a guest (soft delete)

### Reviews/Feedback
- `GET /simplewtstar` - Get all reviews
- `POST /simplewtstar/add` - Add a new review

## Database Schema

### `guest` table
- `id` - Primary key
- `name` - Guest name
- `phone` - Phone number
- `email` - Email address
- `startDate` - Check-in date
- `endDate` - Check-out date
- `roomNumber` - Room number
- `status` - Status (1 = active, 9 = deleted)

### `simplewtstar` table
- `id` - Primary key
- `rating` - Rating (integer)
- `comment` - Review comment
- `guest_id` - Foreign key to guest table

## Troubleshooting

1. **Database Connection Error**: 
   - Ensure MySQL is running
   - Check database credentials in `backend/server.js`
   - Verify the `gss` database exists

2. **Port Already in Use**:
   - Backend: Change port in `backend/server.js` (default: 3000)
   - Frontend: Vite will automatically use the next available port

3. **CORS Issues**:
   - CORS is already enabled in the backend
   - Ensure frontend is making requests to the correct backend URL

## Development

- Backend uses `nodemon` for auto-restart on file changes
- Frontend uses Vite for fast HMR (Hot Module Replacement)







