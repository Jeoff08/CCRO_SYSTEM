/**
 * Development runner: starts Vite dev server and Electron together.
 * Waits for Vite to be ready before launching Electron.
 */
const { spawn } = require("child_process");
const http = require("http");

const VITE_PORT = 5173;

function waitForPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function tryConnect() {
      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume(); // consume response data to free memory
        resolve();
      });

      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });

      req.setTimeout(2000, () => {
        req.destroy();
      });
    }

    tryConnect();
  });
}

// Start Vite
const vite = spawn("npx", ["vite"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

vite.on("error", (err) => {
  console.error("Failed to start Vite:", err);
  process.exit(1);
});

// Wait for Vite, then start Electron
waitForPort(VITE_PORT)
  .then(() => {
    console.log(`\n  Vite is ready on port ${VITE_PORT}, starting Electron...\n`);

    const electron = spawn("npx", ["electron", "."], {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });

    electron.on("close", (code) => {
      console.log("Electron closed with code", code);
      vite.kill();
      process.exit(code || 0);
    });

    electron.on("error", (err) => {
      console.error("Failed to start Electron:", err);
      vite.kill();
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error(err.message);
    vite.kill();
    process.exit(1);
  });

// Handle cleanup
process.on("SIGINT", () => {
  vite.kill();
  process.exit();
});

process.on("SIGTERM", () => {
  vite.kill();
  process.exit();
});

