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
4. Patch the icon onto the executable

The installer is located at:

```
release/CCRO Archive Locator System Setup 2.1.0.exe
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
├── electron/                  Electron main process
│   ├── main.cjs               Main process entry
│   ├── preload.cjs            Preload script (IPC bridge)
│   └── dev-runner.cjs         Dev mode launcher
├── server/                    Express backend + SQLite
│   ├── index.js               Express server entry
│   ├── db/                    Database layer
│   │   ├── index.js           DB barrel export
│   │   ├── connection.js      SQLite connection setup
│   │   ├── schema.js          Table definitions
│   │   ├── migrations.js      Schema migrations
│   │   └── seeds.js           Default seed data
│   ├── lib/                   Shared server utilities
│   │   └── transforms.js      Data transform helpers
│   ├── middleware/             Express middleware
│   │   └── errorHandler.js    Global error handler
│   └── routes/                API route handlers
│       ├── auth.js
│       ├── boxes.js
│       ├── locationProfiles.js
│       └── activityLogs.js
├── src/                       React frontend (Vite + Tailwind CSS v4)
│   ├── App.jsx                Main app component
│   ├── main.jsx               Entry point
│   ├── style.css              Global styles
│   ├── api/                   API client modules
│   │   ├── index.js           API barrel export
│   │   ├── client.js          Base fetch/request helper
│   │   ├── auth.js            Auth API calls
│   │   ├── boxes.js           Box API calls
│   │   ├── locationProfiles.js  Location profile API calls
│   │   └── activityLogs.js    Activity log API calls
│   ├── components/            React components
│   │   ├── auth/
│   │   │   └── LoginForm.jsx
│   │   ├── boxes/
│   │   │   ├── BoxManagement.jsx
│   │   │   ├── BoxForm.jsx
│   │   │   ├── ConfirmBoxStep.jsx
│   │   │   └── DeleteBoxModal.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── DashboardHome.jsx
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   ├── locations/
│   │   │   ├── LocationManagement.jsx
│   │   │   ├── LocationRack3D.jsx   3D rack visualization (Three.js)
│   │   │   └── LocationResultLayout.jsx
│   │   ├── locator/
│   │   │   ├── DocumentLocator.jsx
│   │   │   └── YearCombobox.jsx
│   │   ├── shared/
│   │   │   └── CertificateBadge.jsx
│   │   └── ui/
│   │       ├── index.js       UI barrel export
│   │       ├── Field.jsx
│   │       ├── Label.jsx
│   │       ├── Modal.jsx
│   │       └── Toast.jsx
│   ├── constants/             Shared constants
│   │   ├── index.js           Constants barrel export
│   │   ├── certificates.js    Certificate type definitions
│   │   ├── dates.js           Date/year helpers
│   │   └── locations.js       Location-related constants
│   ├── hooks/                 Custom React hooks
│   │   ├── index.js           Hooks barrel export
│   │   ├── useBoxes.js        Box data hook
│   │   ├── useLocationProfiles.js  Location data hook
│   │   └── useActivityLog.js  Activity log hook
│   └── utils/                 Frontend utilities
│       ├── index.js           Utils barrel export
│       ├── formatting.js      Display formatting helpers
│       ├── location.js        Location logic helpers
│       └── registry.js        Registry number utilities
├── public/                    Static assets
│   ├── logo-rm.png            App logo (transparent)
│   ├── logo-shortcut.png      Shortcut icon
│   └── vite.svg               Vite default asset
├── scripts/                   Build utilities
│   ├── convert-icon.cjs       Icon conversion (JPG → ICO)
│   └── patch-icon.cjs         Patch icon onto built exe
├── build/                     Generated app icons (gitignored)
├── dist/                      Vite build output (gitignored)
├── release/                   Electron installer output (gitignored)
├── index.html                 Vite HTML entry point
├── tsconfig.json              TypeScript config (editor support)
├── package.json
└── vite.config.mts
```

## Tech Stack & Key Dependencies

| Package | Purpose |
|---------|---------|
| React 19, react-dom | UI framework |
| Vite 7 | Dev server & bundler |
| Tailwind CSS v4 | Utility-first styling |
| Express 4 | Backend API server |
| better-sqlite3 | SQLite database driver |
| Electron 33 | Desktop app shell |
| @react-three/fiber, @react-three/drei, three | 3D rack visualization |
| @dnd-kit/core, @dnd-kit/sortable | Drag-and-drop interactions |
| electron-builder | Windows installer packaging |
| concurrently | Run multiple dev scripts in parallel |
