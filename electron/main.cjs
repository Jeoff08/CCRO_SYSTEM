const { app, BrowserWindow } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const isDev = !app.isPackaged;

let mainWindow;

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: "CCRO Archive Locator System",
      icon: isDev
        ? path.join(__dirname, "..", "public", "461661670_1118300596319054_8742723372426556351_n.jpg")
        : path.join(__dirname, "..", "dist", "461661670_1118300596319054_8742723372426556351_n.jpg"),
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true,
    });

    if (isDev) {
      mainWindow.loadURL("http://localhost:5173");
    } else {
      mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(async () => {
    // Set DB path for production (userData is writable, unlike app.asar)
    if (!isDev) {
      process.env.CCRO_DB_PATH = path.join(
        app.getPath("userData"),
        "ccro-archive.db"
      );
    }

    // Start the Express API server (dynamic import for ESM module)
    try {
      const serverPath = path.join(__dirname, "..", "server", "index.js");
      await import(pathToFileURL(serverPath).href);
    } catch (err) {
      console.error("Failed to start Express server:", err);
    }

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
