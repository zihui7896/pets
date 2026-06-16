#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { GIFEncoder, quantize, applyPalette } = require("gifenc");

const cellW = 192;
const cellH = 208;
const atlasW = cellW * 8;
const atlasH = cellH * 9;

const rows = [
  { id: "idle", strips: ["01-idle.png", "00-idle.png"], row: 0, frames: 6, delay: [280, 110, 110, 140, 140, 320] },
  { id: "running-right", strips: ["02-running-right.png", "01-running-right.png"], row: 1, frames: 8, delay: [120, 120, 120, 120, 120, 120, 120, 220] },
  { id: "waving", strips: ["03-waving.png", "02-waving.png"], row: 3, frames: 4, delay: [140, 140, 140, 280] },
  { id: "jumping", strips: ["04-jumping.png", "03-jumping.png"], row: 4, frames: 5, delay: [140, 140, 140, 140, 280] },
  { id: "failed", strips: ["05-failed.png", "04-failed.png"], row: 5, frames: 8, delay: [140, 140, 140, 140, 140, 140, 140, 240] },
  { id: "waiting", strips: ["06-waiting.png", "05-waiting.png"], row: 6, frames: 6, delay: [150, 150, 150, 150, 150, 260] },
  { id: "running", strips: ["07-running.png", "06-running.png"], row: 7, frames: 6, delay: [120, 120, 120, 120, 120, 220] },
  { id: "review", strips: ["08-review.png", "07-review.png"], row: 8, frames: 6, delay: [150, 150, 150, 150, 150, 280] },
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[key] = value;
  }
  return args;
}

function required(args, key) {
  if (!args[key]) throw new Error(`Missing --${key}`);
  return args[key];
}

function petRoot() {
  return process.env.CODEX_HOME
    ? path.join(process.env.CODEX_HOME, "pets")
    : "C:/Users/Administrator/.codex/pets";
}

function greenAlpha(r, g, b) {
  if (g > 150 && r < 120 && b < 140 && g - Math.max(r, b) > 45) return 0;
  if (g > 120 && r < 160 && b < 170 && g - Math.max(r, b) > 25) return 50;
  return 255;
}

async function removeGreen(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const a = greenAlpha(data[i], data[i + 1], data[i + 2]);
    if (a === 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else if (a < 255) {
      data[i + 3] = Math.min(data[i + 3], a);
      data[i + 1] = Math.round(data[i + 1] * 0.65);
    }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function alphaComponents(buffer, minArea = 700) {
  const cleaned = await removeGreen(buffer);
  const { data, info } = await sharp(cleaned).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const visited = new Uint8Array(info.width * info.height);
  const stack = [];
  const boxes = [];
  const isSolid = (x, y) => data[(y * info.width + x) * 4 + 3] > 25;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const start = y * info.width + x;
      if (visited[start] || !isSolid(x, y)) continue;
      visited[start] = 1;
      stack.length = 0;
      stack.push([x, y]);
      let minX = x, maxX = x, minY = y, maxY = y, area = 0;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        area += 1;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
          if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) continue;
          const idx = ny * info.width + nx;
          if (!visited[idx] && isSolid(nx, ny)) {
            visited[idx] = 1;
            stack.push([nx, ny]);
          }
        }
      }
      if (area > minArea && maxX - minX > 20 && maxY - minY > 30) {
        boxes.push({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1, area });
      }
    }
  }
  boxes.sort((a, b) => b.area - a.area);
  return { cleaned, boxes };
}

async function keepLargestComponent(buffer) {
  const { cleaned, boxes } = await alphaComponents(buffer, 10);
  if (!boxes.length) return cleaned;
  const box = boxes[0];
  const { data, info } = await sharp(cleaned).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const keep = new Uint8Array(info.width * info.height);
  const { cleaned: isolated, boxes: allBoxes } = await alphaComponents(cleaned, 10);
  void isolated;
  const target = allBoxes[0] || box;
  for (let y = target.top; y < target.top + target.height; y++) {
    for (let x = target.left; x < target.left + target.width; x++) keep[y * info.width + x] = 1;
  }
  for (let i = 0; i < keep.length; i++) {
    if (!keep[i]) {
      const offset = i * 4;
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function makeCell(cropBuffer) {
  const clean = await removeGreen(cropBuffer);
  const { boxes } = await alphaComponents(clean);
  const box = boxes[0] || { left: 0, top: 0, width: (await sharp(clean).metadata()).width, height: (await sharp(clean).metadata()).height };
  const pad = 8;
  const meta = await sharp(clean).metadata();
  const left = Math.max(0, box.left - pad);
  const top = Math.max(0, box.top - pad);
  const width = Math.min(meta.width - left, box.width + pad * 2);
  const height = Math.min(meta.height - top, box.height + pad * 2);
  const trimmed = await sharp(clean).extract({ left, top, width, height }).png().toBuffer();
  const tMeta = await sharp(trimmed).metadata();
  const fit = Math.min(166 / tMeta.width, 188 / tMeta.height);
  const resized = await sharp(trimmed)
    .resize(Math.max(1, Math.round(tMeta.width * fit)), Math.max(1, Math.round(tMeta.height * fit)))
    .png()
    .toBuffer();
  const rMeta = await sharp(resized).metadata();
  const cell = await sharp({
    create: {
      width: cellW,
      height: cellH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left: Math.round((cellW - rMeta.width) / 2), top: Math.round((cellH - rMeta.height) / 2) }])
    .png()
    .toBuffer();
  return keepLargestComponent(cell);
}

async function splitStrip(stripPath, row, outRoot) {
  const strip = sharp(stripPath);
  const meta = await strip.metadata();
  const raw = await strip.png().toBuffer();
  const { cleaned, boxes } = await alphaComponents(raw);
  const selected = boxes
    .slice(0, row.frames)
    .sort((a, b) => a.left + a.width / 2 - (b.left + b.width / 2));
  const slotW = Math.floor(meta.width / row.frames);
  const outDir = path.join(outRoot, row.id);
  await fs.mkdir(outDir, { recursive: true });
  const cells = [];
  for (let i = 0; i < row.frames; i++) {
    let crop;
    if (selected[i]) {
      const box = selected[i];
      const pad = 8;
      const left = Math.max(0, box.left - pad);
      const top = Math.max(0, box.top - pad);
      const width = Math.min(meta.width - left, box.width + pad * 2);
      const height = Math.min(meta.height - top, box.height + pad * 2);
      crop = await sharp(cleaned).extract({ left, top, width, height }).png().toBuffer();
    } else {
      const left = Math.max(0, Math.round(i * slotW));
      const width = i === row.frames - 1 ? meta.width - left : slotW;
      crop = await strip.clone().extract({ left, top: 0, width, height: meta.height }).png().toBuffer();
    }
    const cell = await makeCell(crop);
    await fs.writeFile(path.join(outDir, `${String(i).padStart(2, "0")}.png`), cell);
    cells.push(cell);
  }
  return cells;
}

async function writeGif(frames, outPath, delays) {
  const gif = GIFEncoder();
  for (let i = 0; i < frames.length; i++) {
    const rgba = await sharp(frames[i]).flatten({ background: { r: 18, g: 21, b: 26 } }).ensureAlpha().raw().toBuffer();
    const palette = quantize(rgba, 256);
    const indexed = applyPalette(rgba, palette);
    gif.writeFrame(indexed, cellW, cellH, { palette, delay: delays[i] || 140 });
  }
  gif.finish();
  await fs.writeFile(outPath, gif.bytes());
}

async function main() {
  const args = parseArgs(process.argv);
  const runDir = path.resolve(required(args, "run-dir"));
  const stripsDir = path.resolve(required(args, "strips-dir"));
  const petId = required(args, "pet-id");
  const displayName = required(args, "display-name");
  const description = args.description || "A custom Image2-generated Codex desktop pet.";
  const packageDir = args["package-dir"] ? path.resolve(args["package-dir"]) : path.join(petRoot(), petId);

  const finalDir = path.join(runDir, "final");
  const qaDir = path.join(runDir, "qa");
  const previewDir = path.join(qaDir, "previews");
  const framesDir = path.join(runDir, "intermediate", "frames");
  for (const dir of [finalDir, qaDir, previewDir, framesDir, packageDir]) await fs.mkdir(dir, { recursive: true });

  const atlasComposites = [];
  const manifest = [];
  for (const row of rows) {
    let stripPath = null;
    for (const candidate of row.strips) {
      const full = path.join(stripsDir, candidate);
      try {
        await fs.access(full);
        stripPath = full;
        break;
      } catch {
        // try next alias
      }
    }
    if (!stripPath) throw new Error(`Missing strip for ${row.id}; tried ${row.strips.join(", ")}`);
    const cells = await splitStrip(stripPath, row, framesDir);
    await writeGif(cells, path.join(previewDir, `${row.id}.gif`), row.delay);
    for (let col = 0; col < cells.length; col++) {
      atlasComposites.push({ input: cells[col], left: col * cellW, top: row.row * cellH });
      manifest.push({ state: row.id, row: row.row, col, delayMs: row.delay[col] });
    }
  }

  const rightDir = path.join(framesDir, "running-right");
  const leftDir = path.join(framesDir, "running-left");
  await fs.mkdir(leftDir, { recursive: true });
  const leftCells = [];
  for (let col = 0; col < 8; col++) {
    const mirrored = await sharp(path.join(rightDir, `${String(col).padStart(2, "0")}.png`)).flop().png().toBuffer();
    await fs.writeFile(path.join(leftDir, `${String(col).padStart(2, "0")}.png`), mirrored);
    leftCells.push(mirrored);
    atlasComposites.push({ input: mirrored, left: col * cellW, top: 2 * cellH });
    manifest.push({ state: "running-left", row: 2, col, delayMs: col === 7 ? 220 : 120, derivedFrom: "running-right" });
  }
  await writeGif(leftCells, path.join(previewDir, "running-left.gif"), [120, 120, 120, 120, 120, 120, 120, 220]);

  const atlasPng = path.join(finalDir, "spritesheet.png");
  const atlasWebp = path.join(finalDir, "spritesheet.webp");
  await sharp({
    create: { width: atlasW, height: atlasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(atlasComposites).png().toFile(atlasPng);
  await sharp(atlasPng).webp({ lossless: true, effort: 6 }).toFile(atlasWebp);
  const contactSheet = path.join(qaDir, "contact-sheet.png");
  await sharp({
    create: { width: atlasW, height: atlasH, channels: 4, background: { r: 18, g: 21, b: 26, alpha: 1 } },
  }).composite([{ input: atlasPng, left: 0, top: 0 }]).png().toFile(contactSheet);

  const meta = await sharp(atlasWebp).metadata();
  const validation = { ok: meta.format === "webp" && meta.width === atlasW && meta.height === atlasH && meta.hasAlpha, format: meta.format, width: meta.width, height: meta.height, hasAlpha: meta.hasAlpha };
  await fs.writeFile(path.join(finalDir, "validation.json"), JSON.stringify(validation, null, 2));
  await fs.writeFile(path.join(runDir, "intermediate", "frame-manifest.json"), JSON.stringify(manifest, null, 2));
  await fs.copyFile(atlasWebp, path.join(packageDir, "spritesheet.webp"));
  await fs.writeFile(path.join(packageDir, "pet.json"), JSON.stringify({ id: petId, displayName, description, spritesheetPath: "spritesheet.webp" }, null, 2));
  await fs.writeFile(path.join(qaDir, "run-summary.json"), JSON.stringify({ ok: validation.ok, runDir, packageDir, spritesheet: atlasWebp, contactSheet, previewDir }, null, 2));
  console.log(JSON.stringify({ validation, runDir, packageDir, spritesheet: atlasWebp, contactSheet, previewDir }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
