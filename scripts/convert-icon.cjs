/**
 * Convert the CCRO logo JPG to a proper Windows .ico file
 * for use with electron-builder / NSIS installer.
 */
const sharp = require("sharp");
const { default: pngToIco } = require("png-to-ico");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "461661670_1118300596319054_8742723372426556351_n.jpg");
const BUILD_DIR = path.join(__dirname, "..", "build");
const OUT_PNG = path.join(BUILD_DIR, "icon.png");
const OUT_ICO = path.join(BUILD_DIR, "icon.ico");

(async () => {
  // Ensure build/ directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Convert JPG → 256×256 PNG (required size for Windows icons)
  await sharp(SRC)
    .resize(256, 256)
    .png()
    .toFile(OUT_PNG);
  console.log("Created", OUT_PNG);

  // Convert PNG → ICO
  const icoBuffer = await pngToIco(OUT_PNG);
  fs.writeFileSync(OUT_ICO, icoBuffer);
  console.log("Created", OUT_ICO);
})();

