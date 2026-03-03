/**
 * Electron main process.
 * – Starts the Express API server as a child process
 * – Creates the BrowserWindow with the CCRO icon
 * – In dev mode loads from Vite; in production loads dist/index.html
 */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");

// #region agent log
const LOG_PATH = path.join(__dirname, "..", "debug-e27ead.log");
function _dbg(loc, msg, data) {
  const payload = JSON.stringify({ sessionId: "e27ead", location: loc, message: msg, data: data || {}, timestamp: Date.now(), hypothesisId: "A" }) + "\n";
  fs.appendFileSync(LOG_PATH, payload);
}
// #endregion

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
    show: false,
    webPreferences: {
      preload: isDev ? undefined : path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });


  // #region agent log
  const loadUrl = isDev ? "http://127.0.0.1:5174" : "file://" + path.join(__dirname, "..", "dist", "index.html");
  _dbg("main.cjs:createWindow", "loadURL called", { url: loadUrl, isDev });
  mainWindow.webContents.on("did-finish-load", () => {
    const url = mainWindow.webContents.getURL();
    _dbg("main.cjs:did-finish-load", "page load finished", { url });
    const isDevUrl = url.startsWith("http://127.0.0.1:5174") || url.startsWith("http://localhost:5174");
    const isProdUrl = url.startsWith("file://");
    if (isDevUrl || isProdUrl) mainWindow.show();
  });
  mainWindow.webContents.on("did-fail-load", (e, code, desc, url) => {
    _dbg("main.cjs:did-fail-load", "page load failed", { code, desc, url });
    mainWindow.show();
  });
  mainWindow.webContents.on("console-message", (e, level, msg, line, sourceId) => {
    if (level >= 3) _dbg("main.cjs:console", "renderer console", { level, msg: msg.slice(0, 500), line, sourceId });
  });
  // #endregion

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5174");
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
