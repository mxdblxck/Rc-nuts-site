// scripts/optimize-images.mjs
// Converts PNG images in /public to WebP and compresses them

import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const targets = [
  // [input, output, options]
  { file: "hero_premium.png",       quality: 82, width: null },
  { file: "hero_premium_phone.png", quality: 82, width: null },
  { file: "logo.png",               quality: 90, width: 800 },  // resize logo — 3.9MB is absurd
  { file: "favicon.png",            quality: 90, width: 64  },
  { file: "بذور.png",               quality: 85, width: null },
  { file: "خلطات.png",              quality: 85, width: null },
  { file: "مجففات.png",             quality: 85, width: null },
  { file: "مكسرات.png",             quality: 85, width: null },
];

async function getSize(path) {
  const s = await stat(path);
  return (s.size / 1024).toFixed(1) + " KB";
}

console.log("🖼️  RC Nuts — Image Optimizer\n");

for (const { file, quality, width } of targets) {
  const input  = join(publicDir, file);
  const webpOut = join(publicDir, file.replace(/\.png$/i, ".webp"));
  const pngOut  = join(publicDir, file); // overwrite original with compressed PNG

  try {
    let pipeline = sharp(input);
    if (width) pipeline = pipeline.resize(width, null, { withoutEnlargement: true });

    const before = await getSize(input);

    // Write WebP
    await pipeline.clone().webp({ quality }).toFile(webpOut);
    const afterWebp = await getSize(webpOut);

    // Overwrite original PNG with compressed version
    await pipeline.clone().png({ compressionLevel: 9, quality }).toFile(pngOut + ".tmp");
    // rename
    const { rename } = await import("fs/promises");
    await rename(pngOut + ".tmp", pngOut);
    const afterPng = await getSize(pngOut);

    console.log(`✅ ${file}`);
    console.log(`   Before: ${before}`);
    console.log(`   PNG:    ${afterPng}  |  WebP: ${afterWebp}\n`);
  } catch (e) {
    console.log(`❌ ${file}: ${e.message}\n`);
  }
}

console.log("✨ Done!");
