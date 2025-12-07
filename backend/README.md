# Focus Guard Backend API

Express.js backend with MongoDB for the Focus Guard productivity app.

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/focus-guard
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   # Development (with hot reload)
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Blocked Websites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blocked-websites` | Get all blocked websites |
| POST | `/api/blocked-websites` | Add a blocked website |
| POST | `/api/blocked-websites/bulk` | Bulk add websites |
| PUT | `/api/blocked-websites/:id` | Update a website |
| DELETE | `/api/blocked-websites/:id` | Remove a website |

### Time Blocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-blocks` | Get all time blocks |
| GET | `/api/time-blocks/active-now` | Get currently active blocks |
| POST | `/api/time-blocks` | Create a time block |
| PUT | `/api/time-blocks/:id` | Update a time block |
| PATCH | `/api/time-blocks/:id/toggle` | Toggle active status |
| DELETE | `/api/time-blocks/:id` | Delete a time block |

### Focus Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/focus-sessions` | Get all sessions |
| GET | `/api/focus-sessions/active` | Get active session |
| GET | `/api/focus-sessions/stats` | Get session statistics |
| POST | `/api/focus-sessions` | Start a new session |
| PUT | `/api/focus-sessions/:id/end` | End a session |

### Extension

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/extension/status` | Get blocking status for extension |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blockedWebsiteController.js
│   │   ├── focusSessionController.js
│   │   └── timeBlockController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── BlockedWebsite.js
│   │   ├── FocusSession.js
│   │   └── TimeBlock.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── blockedWebsiteRoutes.js
│   │   ├── focusSessionRoutes.js
│   │   └── timeBlockRoutes.js
│   └── server.js             # Entry point
├── .env.example
├── package.json
└── README.md
```

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```
