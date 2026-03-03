/**
 * Development runner: starts Vite dev server and Electron together.
 * Waits for Vite to be ready before launching Electron.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

// #region agent log
function _dbg(loc, msg, data) {
  const payload = JSON.stringify({ sessionId: "e27ead", location: loc, message: msg, data: data || {}, timestamp: Date.now(), hypothesisId: "E" }) + "\n";
  fs.appendFileSync(path.join(process.cwd(), "debug-e27ead.log"), payload);
}
// #endregion

const VITE_PORT = 5174;

function waitForVite(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function tryConnect() {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          const ok = res.statusCode === 200 && (body.includes("<html") || body.includes("<!doctype"));
          if (ok) return resolve();
          if (Date.now() - start > timeout) return reject(new Error(`Vite not ready: status ${res.statusCode}`));
          setTimeout(tryConnect, 300);
        });
      });

      req.on("error", () => {
        if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for port ${port}`));
        else setTimeout(tryConnect, 500);
      });
      req.setTimeout(5000, () => { req.destroy(); });
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
waitForVite(VITE_PORT)
  .then(() => {
    _dbg("dev-runner.cjs", "Vite port ready, spawning Electron", { port: VITE_PORT });
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

