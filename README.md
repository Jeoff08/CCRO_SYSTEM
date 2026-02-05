# CCRO Archive Locator System

A modern document locator system for the City Civil Registrar Office (CCRO) archive management.

## Features

- **Document Locator**: Search for physical boxes using certificate type, year, and registry number
- **Box Management**: Register and maintain box records
- **Location Management**: Configure location profiles to match physical archive layout
- **Activity Logging**: Track all searches, logins, and box changes
- **Database Backend**: SQLite database using better-sqlite3 for persistent storage

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
# Start both frontend and backend
npm run dev:all

# Or start them separately:
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.

### Default Credentials

- Username: `admin`
- Password: `ccro123`

## Database

The database file (`ccro-archive.db`) will be automatically created in the project root on first run. The schema includes:

- **users**: User accounts
- **boxes**: Box records
- **location_profiles**: Location configuration profiles
- **activity_logs**: Activity tracking

## API Endpoints

### Boxes
- `GET /api/boxes` - Get all boxes
- `GET /api/boxes/:id` - Get box by ID
- `POST /api/boxes` - Create box
- `PUT /api/boxes/:id` - Update box
- `DELETE /api/boxes/:id` - Delete box

### Location Profiles
- `GET /api/location-profiles` - Get all profiles
- `GET /api/location-profiles/active` - Get active profile
- `GET /api/location-profiles/:id` - Get profile by ID
- `POST /api/location-profiles` - Create or update profile
- `PUT /api/location-profiles/:id/active` - Set active profile
- `DELETE /api/location-profiles/:id` - Delete profile

### Activity Logs
- `GET /api/activity-logs` - Get all logs
- `POST /api/activity-logs` - Create log
- `GET /api/activity-logs/user/:userId` - Get logs by user

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/user/:id` - Get user by ID

## Project Structure

```
.
├── server/              # Backend server
│   ├── db.js           # Database setup
│   ├── index.js        # Express server
│   └── routes/         # API routes
├── src/                # Frontend React app
│   ├── components/     # React components
│   ├── api.js          # API client
│   └── App.jsx         # Main app component
└── package.json
```

## Development

The project uses:
- **Vite** for frontend development
- **Express** for backend API
- **better-sqlite3** for database operations

## License

Private - CCRO Internal Use Only

