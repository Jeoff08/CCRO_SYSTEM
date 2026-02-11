# CCRO Archive Locator System — Setup Guide (After Clone)

## Prerequisites

- **Node.js** v18 or higher — [https://nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Windows OS** (for Electron build)

## Step 1: Install Dependencies

Open a terminal in the project root folder, then run:

```bash
npm install
```

> This will also automatically run `postinstall` to rebuild native Electron dependencies (better-sqlite3).

## Step 2: Run in Development Mode

### Option A — Web only (frontend + backend, no Electron window)

```bash
npm run dev:all
```

- Frontend → `http://localhost:5173`
- Backend API → `http://localhost:3001`

### Option B — Electron desktop app (full dev mode)

```bash
npm run electron:dev
```

This starts Vite, waits for it to be ready, then opens the Electron window. The Express API server starts automatically inside Electron's main process.

### Option C — Start frontend and backend separately

```bash
npm run dev          # Vite frontend on port 5173
npm run dev:server   # Express API on port 3001
```

## Step 3: Login with Default Credentials

| Field    | Value     |
|----------|-----------|
| Username | `admin`   |
| Password | `ccro123` |

The SQLite database file (`ccro-archive.db`) is created automatically in the project root on first run.

## Step 4: Build for Production (Windows Installer)

```bash
npm run electron:build
```

This will:

1. Convert the app icon (JPG → PNG → ICO)
2. Build the Vite frontend (output in `dist/`)
3. Package everything with electron-builder (output in `release/`)

The installer is located at:

```
release/CCRO Archive Locator System Setup 1.0.0.exe
```

## Notes

- The `.gitignore` excludes `node_modules/`, `*.db`, `dist/`, `build/`, and `release/` — so those are regenerated after clone.
- **No `.env` file is required.** The only env var used is `CCRO_DB_PATH`, which Electron sets automatically in production to store the DB in the user's AppData folder.
- The Express API runs on port **3001** by default. You can override it with the `PORT` environment variable.

## Available Scripts

| Script                  | Description                              |
|-------------------------|------------------------------------------|
| `npm run dev`           | Vite dev server (frontend only)          |
| `npm run dev:server`    | Express API server (backend only)        |
| `npm run dev:all`       | Both frontend + backend together         |
| `npm run electron:dev`  | Full Electron dev mode                   |
| `npm run build`         | Vite production build                    |
| `npm run electron:build`| Full Windows installer build             |

## Project Structure

```
├── electron/              Electron main process
│   ├── main.cjs           Main process entry
│   ├── preload.cjs        Preload script
│   └── dev-runner.cjs     Dev mode launcher
├── server/                Express backend + SQLite
│   ├── db.js              Database setup & schema
│   ├── index.js           Express server entry
│   └── routes/            API route handlers
│       ├── auth.js
│       ├── boxes.js
│       ├── locationProfiles.js
│       └── activityLogs.js
├── src/                   React frontend (Vite + Tailwind CSS)
│   ├── App.jsx            Main app component
│   ├── api.js             API client helper
│   ├── main.jsx           Entry point
│   ├── style.css          Global styles
│   └── components/        React components
│       ├── Dashboard.jsx
│       ├── DocumentLocator.jsx
│       ├── BoxManagement.jsx
│       ├── LocationManagement.jsx
│       ├── ActivityLog.jsx
│       ├── LoginForm.jsx
│       ├── Sidebar.jsx
│       └── CertificateBadge.jsx
├── scripts/               Build utilities
│   └── convert-icon.cjs   Icon conversion (JPG → ICO)
├── build/                 Generated app icons (gitignored)
├── dist/                  Vite build output (gitignored)
├── release/               Electron installer output (gitignored)
├── package.json
└── vite.config.mts
```
