/**
 * Post-build step: embed the CCRO icon into the built .exe files
 * using rcedit so the desktop shortcut shows the correct logo.
 */
const { rcedit } = require("rcedit");
const path = require("path");
const fs = require("fs");

const ICO_PATH = path.join(__dirname, "..", "build", "icon.ico");
const RELEASE_DIR = path.join(__dirname, "..", "release", "win-unpacked");
const EXE_NAME = "CCRO Archive Locator System.exe";
const EXE_PATH = path.join(RELEASE_DIR, EXE_NAME);

async function main() {
  if (!fs.existsSync(EXE_PATH)) {
    console.error("✖ Exe not found:", EXE_PATH);
    process.exit(1);
  }
  if (!fs.existsSync(ICO_PATH)) {
    console.error("✖ Icon not found:", ICO_PATH);
    process.exit(1);
  }

  console.log("Patching icon into", EXE_NAME, "...");

  await rcedit(EXE_PATH, {
    icon: ICO_PATH,
    "version-string": {
      ProductName: "CCRO Archive Locator System",
      FileDescription: "CCRO Archive Locator System",
      CompanyName: "CCRO Iligan",
    },
  });

  console.log("✔ Icon successfully embedded into", EXE_NAME);
}

main().catch((err) => {
  console.error("Icon patching failed:", err);
  process.exit(1);
});

