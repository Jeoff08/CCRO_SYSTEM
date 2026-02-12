/**
 * Convert the CCRO logo to icon formats for Electron builds.
 * Source:  public/logo-shortcut.png
 * Output:  build/icon.png  (256×256)
 *          build/icon.ico  (Windows icon – multi-size)
 */
const sharp = require("sharp");
const { default: pngToIco } = require("png-to-ico");
const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "public", "logo-shortcut.png");
const BUILD_DIR = path.join(__dirname, "..", "build");
const PNG_OUT = path.join(BUILD_DIR, "icon.png");
const ICO_OUT = path.join(BUILD_DIR, "icon.ico");

async function main() {
  // Ensure source exists
  if (!fs.existsSync(SOURCE)) {
    console.error("✖ Source image not found:", SOURCE);
    process.exit(1);
  }

  // Ensure build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Generate 256×256 PNG for the build
  await sharp(SOURCE).resize(256, 256).png().toFile(PNG_OUT);
  console.log("✔ build/icon.png created (256×256)");

  // Generate multiple sizes for a better Windows ICO
  const sizes = [16, 32, 48, 64, 128, 256];
  const tempFiles = [];

  for (const size of sizes) {
    const tempPath = path.join(BUILD_DIR, `icon-${size}.png`);
    await sharp(SOURCE).resize(size, size).png().toFile(tempPath);
    tempFiles.push(tempPath);
  }

  // Convert all sizes into a single ICO
  const icoBuf = await pngToIco(tempFiles);
  fs.writeFileSync(ICO_OUT, icoBuf);
  console.log("✔ build/icon.ico created (multi-size)");

  // Clean up temporary PNGs
  for (const f of tempFiles) {
    fs.unlinkSync(f);
  }
}

main().catch((err) => {
  console.error("Icon conversion failed:", err);
  process.exit(1);
});
