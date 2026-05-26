import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const resourcesDir = join(rootDir, "resources");
const svgPath = join(resourcesDir, "icon.svg");

// Ensure resources directory exists
if (!existsSync(resourcesDir)) {
  mkdirSync(resourcesDir, { recursive: true });
}

const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];

async function generatePNG(size) {
  const pngPath = join(resourcesDir, `icon-${size}.png`);
  await sharp(svgPath).resize(size, size).png().toFile(pngPath);
  console.log(`  ✓ Generated icon-${size}.png`);
  return pngPath;
}

async function generateICO() {
  const icoPath = join(resourcesDir, "icon.ico");
  // Generate multiple sizes for ICO
  const buffers = await Promise.all(
    [16, 32, 48, 64, 128, 256].map((size) =>
      sharp(svgPath).resize(size, size).png().toBuffer(),
    ),
  );

  // Write ICO file with multiple sizes
  // ICO format: header + icon entries + icon data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(buffers.length, 4); // number of images

  let dataOffset = 6 + 16 * buffers.length;
  const entries = [];
  const imageData = [];

  for (let i = 0; i < buffers.length; i++) {
    const size = [16, 32, 48, 64, 128, 256][i];
    const entry = Buffer.alloc(16);
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    entry.writeUInt8(w, 0); // width
    entry.writeUInt8(h, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffers[i].length, 8); // data size
    entry.writeUInt32LE(dataOffset, 12); // data offset
    entries.push(entry);
    imageData.push(buffers[i]);
    dataOffset += buffers[i].length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...imageData]);

  const fs = await import("node:fs");
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`  ✓ Generated icon.ico (16-256px multi-res)`);
}

async function main() {
  console.log("\n🖼️  Generating icons from resources/icon.svg...\n");

  // Generate all PNG sizes
  for (const size of sizes) {
    await generatePNG(size);
  }

  // Copy largest PNG as icon.png (for electron-builder)
  const mainIconPath = join(resourcesDir, "icon.png");
  const fs = await import("node:fs");
  fs.copyFileSync(join(resourcesDir, "icon-1024.png"), mainIconPath);
  console.log("  ✓ Generated icon.png (1024px)");

  // Generate ICO
  await generateICO();

  // Generate favicon.ico
  const faviconPath = join(rootDir, "src", "renderer", "public", "favicon.ico");
  const faviconBuffer = await sharp(svgPath).resize(32, 32).png().toBuffer();

  const faviconHeader = Buffer.alloc(6);
  faviconHeader.writeUInt16LE(0, 0);
  faviconHeader.writeUInt16LE(1, 2);
  faviconHeader.writeUInt16LE(1, 4);

  const faviconEntry = Buffer.alloc(16);
  faviconEntry.writeUInt8(32, 0);
  faviconEntry.writeUInt8(32, 1);
  faviconEntry.writeUInt8(0, 2);
  faviconEntry.writeUInt8(0, 3);
  faviconEntry.writeUInt16LE(1, 4);
  faviconEntry.writeUInt16LE(32, 6);
  faviconEntry.writeUInt32LE(faviconBuffer.length, 8);
  faviconEntry.writeUInt32LE(22, 12);

  fs.writeFileSync(
    faviconPath,
    Buffer.concat([faviconHeader, faviconEntry, faviconBuffer]),
  );
  console.log("  ✓ Generated favicon.ico (32px)");

  console.log("\n✅ All icons generated successfully!\n");
}

main().catch((err) => {
  console.error("❌ Icon generation failed:", err);
  process.exit(1);
});
