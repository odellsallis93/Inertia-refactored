import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const [originalDir, migratedDir, outputDir] = process.argv.slice(2);

if (!originalDir || !migratedDir || !outputDir) {
  console.error(
    "Usage: node .cursor/skills/animation-parity/scripts/diff-frames.mjs <original-dir> <migrated-dir> <output-dir>",
  );
  process.exit(1);
}

const framePattern = /^frame-\d+\.png$/;
const listFrames = async (directory) =>
  (await readdir(directory)).filter((name) => framePattern.test(name)).sort();

const originalFrames = await listFrames(originalDir);
const migratedFrames = await listFrames(migratedDir);
const frameCount = Math.min(originalFrames.length, migratedFrames.length);
const threshold = Number(process.env.ANIMATION_PIXEL_THRESHOLD ?? "0.1");
const peakThreshold = Number(process.env.ANIMATION_PEAK_THRESHOLD ?? "3");

if (originalFrames.length !== migratedFrames.length) {
  console.error(
    `Frame count mismatch: original=${originalFrames.length}, migrated=${migratedFrames.length}`,
  );
  process.exitCode = 1;
}

await mkdir(outputDir, { recursive: true });

const results = [];
for (let index = 0; index < frameCount; index += 1) {
  const original = PNG.sync.read(
    await readFile(join(originalDir, originalFrames[index])),
  );
  const migrated = PNG.sync.read(
    await readFile(join(migratedDir, migratedFrames[index])),
  );

  if (original.width !== migrated.width || original.height !== migrated.height) {
    throw new Error(
      `Image size mismatch at frame ${index + 1}: ` +
        `${original.width}x${original.height} vs ${migrated.width}x${migrated.height}`,
    );
  }

  const diff = new PNG({ width: original.width, height: original.height });
  const mismatchedPixels = pixelmatch(
    original.data,
    migrated.data,
    diff.data,
    original.width,
    original.height,
    { threshold },
  );
  const mismatchPercent =
    (mismatchedPixels / (original.width * original.height)) * 100;
  const frameName = `frame-${String(index + 1).padStart(4, "0")}.png`;

  await writeFile(join(outputDir, frameName), PNG.sync.write(diff));
  results.push({
    frame: frameName,
    timestampMs: Math.round((index / Number(process.env.ANIMATION_FPS ?? "10")) * 1000),
    mismatchPercent: Number(mismatchPercent.toFixed(4)),
  });
}

const percentages = results.map((result) => result.mismatchPercent);
const meanMismatch =
  percentages.length === 0
    ? 0
    : percentages.reduce((sum, value) => sum + value, 0) / percentages.length;
const peakMismatch = percentages.length === 0 ? 0 : Math.max(...percentages);
const aboveThreshold = results.filter(
  (result) => result.mismatchPercent > peakThreshold,
);
const summary = {
  originalDir,
  migratedDir,
  frameCount,
  originalFrameCount: originalFrames.length,
  migratedFrameCount: migratedFrames.length,
  meanMismatchPercent: Number(meanMismatch.toFixed(4)),
  peakMismatchPercent: Number(peakMismatch.toFixed(4)),
  peakThresholdPercent: peakThreshold,
  passed: originalFrames.length === migratedFrames.length && aboveThreshold.length === 0,
  framesAboveThreshold: aboveThreshold,
  frames: results,
};

await writeFile(join(outputDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));

if (!summary.passed) process.exitCode = 1;
