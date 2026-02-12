/**
 * Electron main process.
 * – Starts the Express API server as a child process
 * – Creates the BrowserWindow with the CCRO icon
 * – In dev mode loads from Vite; in production loads dist/index.html
 */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

const isDev = !app.isPackaged;

let mainWindow;
let serverProcess;

/* ───── Express API server ───── */
function startServer() {
  const dbPath = isDev
    ? path.join(__dirname, "..", "ccro-archive.db")
    : path.join(app.getPath("userData"), "ccro-archive.db");

  const serverPath = isDev
    ? path.join(__dirname, "..", "server", "index.js")
    : path.join(process.resourcesPath, "app.asar", "server", "index.js");

  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      CCRO_DB_PATH: dbPath,
      PORT: "3001",
    },
    // Silence stdout/stderr from the child in production
    silent: !isDev,
  });

  serverProcess.on("error", (err) => {
    console.error("Server process error:", err);
  });
}

/* ───── BrowserWindow ───── */
function createWindow() {
  // Icon for the window title-bar / taskbar
  const iconPath = isDev
    ? path.join(__dirname, "..", "build", "icon.png")
    : path.join(process.resourcesPath, "app.asar", "dist", "logo-shortcut.png");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,
    title: "CCRO Archive Locator System",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    // Uncomment to open DevTools automatically in dev mode:
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* ───── App lifecycle ───── */
app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on("activate", () => {
    // macOS: re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
