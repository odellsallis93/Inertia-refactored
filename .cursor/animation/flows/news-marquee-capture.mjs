#!/usr/bin/env node
/**
 * Capture news-marquee evidence: timed screenshots, structural snapshots,
 * and card-position samples around the 30s wrap.
 *
 * Usage:
 *   node .cursor/animation/flows/news-marquee-capture.mjs original
 *   node .cursor/animation/flows/news-marquee-capture.mjs migrated
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const phase = process.argv[2];
if (phase !== "original" && phase !== "migrated") {
  console.error("Usage: node news-marquee-capture.mjs <original|migrated>");
  process.exit(1);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = join(repoRoot, ".cursor/artifacts/animations/news-marquee", phase);
const framesDir = join(outDir, "frames");
const url = process.env.MIGRATED_URL ?? "http://localhost:3000/about";
const viewport = {
  width: Number(process.env.ANIMATION_VIEWPORT_WIDTH ?? 1440),
  height: Number(process.env.ANIMATION_VIEWPORT_HEIGHT ?? 900),
};
const dpr = Number(process.env.ANIMATION_DPR ?? 2);

await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--hide-scrollbars"],
});

const context = await browser.newContext({
  viewport,
  deviceScaleFactor: dpr,
  colorScheme: "light",
  reducedMotion: "no-preference",
});

const page = await context.newPage();
page.setDefaultTimeout(60_000);

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("#scrollCol");
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

await page.evaluate(() => {
  const hide = (el, extra) => {
    if (!el) return;
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
    extra?.(el);
  };
  hide(document.querySelector(".fullSite-WrapperWel"), (el) => {
    el.style.setProperty("display", "none", "important");
  });
  const wrap = document.querySelector(".fullSite-Wrapper");
  if (wrap) {
    wrap.style.setProperty("visibility", "visible", "important");
    wrap.style.setProperty("opacity", "1", "important");
  }
  for (const sel of [
    ".transBlk__lt",
    ".transCont__gridleft",
    ".transCont__News",
    ".transCont__about",
    ".transCont__overlayGrid",
    ".transCont__header",
  ]) {
    document.querySelectorAll(sel).forEach((el) => hide(el));
  }
});

await page.evaluate(() => {
  window.__t0 = performance.now();
  window.__marqueeLog = [];

  const sample = () => {
    const col = document.querySelector("#scrollCol");
    const overlay = document.querySelector(".overlayGrid");
    const boxes = [...document.querySelectorAll(".boxMarquee")];
    const overlayRect = overlay?.getBoundingClientRect();
    const visibleSrcs = boxes
      .filter((box) => {
        if (!overlayRect) return false;
        const r = box.getBoundingClientRect();
        return (
          r.bottom > overlayRect.top &&
          r.top < overlayRect.bottom &&
          r.right > overlayRect.left &&
          r.left < overlayRect.right
        );
      })
      .map((box) => box.querySelector("img")?.getAttribute("src") ?? "");

    return {
      t: performance.now() - window.__t0,
      cardCount: boxes.length,
      wrapperHeight: col?.getBoundingClientRect().height ?? 0,
      wrapperTransform: col ? getComputedStyle(col).transform : null,
      trackTransform: (() => {
        const track = document.querySelector(".marqueeTrack");
        return track ? getComputedStyle(track).transform : null;
      })(),
      visibleSrcs,
      cards: boxes.map((box, i) => {
        const r = box.getBoundingClientRect();
        return {
          i,
          top: Number(r.top.toFixed(3)),
          height: Number(r.height.toFixed(3)),
          src: box.querySelector("img")?.getAttribute("src") ?? "",
          transform: getComputedStyle(box).transform,
        };
      }),
    };
  };

  window.__sampleMarquee = sample;
  const tick = () => {
    window.__marqueeLog.push(sample());
    window.__marqueeRaf = requestAnimationFrame(tick);
  };
  tick();
});

const waitUntil = async (ms) => {
  await page.waitForFunction(
    (target) => performance.now() - window.__t0 >= target,
    ms,
    { polling: 10, timeout: 45_000 },
  );
};

const saveScreenshot = async (name) => {
  const actualT = await page.evaluate(() => performance.now() - window.__t0);
  const path = join(outDir, name);
  await page.screenshot({ path, type: "png" });
  return { name, actualT };
};

const saveFrame = async (index, intendedMs) => {
  const actualT = await page.evaluate(() => performance.now() - window.__t0);
  const name = `frame-${String(index).padStart(4, "0")}.png`;
  await page.screenshot({ path: join(framesDir, name), type: "png" });
  return { frame: name, intendedMs, actualT: Number(actualT.toFixed(1)) };
};

const snapshot = async () =>
  page.evaluate(() => {
    const col = document.querySelector("#scrollCol");
    return {
      url: location.href,
      cardCount: document.querySelectorAll(".boxMarquee").length,
      html: col?.outerHTML ?? "",
      sample: window.__sampleMarquee?.() ?? null,
    };
  });

const screenshotMeta = [];
const frameMeta = [];

const beforeShot = await saveScreenshot("before.annotated.png");
screenshotMeta.push({ ...beforeShot, label: "before" });
const beforeSnap = await snapshot();
await writeFile(
  join(outDir, "before.snapshot.txt"),
  JSON.stringify(beforeSnap, null, 2),
);

let frameIndex = 1;
for (let t = 0; t <= 1000; t += 100) {
  if (t > 0) await waitUntil(t);
  frameMeta.push(await saveFrame(frameIndex, t));
  frameIndex += 1;
}

await waitUntil(29_500);
for (let t = 29_500; t <= 31_000; t += 100) {
  await waitUntil(t);
  frameMeta.push(await saveFrame(frameIndex, t));
  frameIndex += 1;
}

const seamSamples = {};
for (const t of [29_900, 30_000, 30_100]) {
  await waitUntil(t);
  seamSamples[t] = await page.evaluate(() => window.__sampleMarquee());
}

const afterShot = await saveScreenshot("after.png");
screenshotMeta.push({ ...afterShot, label: "after" });
const afterSnap = await snapshot();
await writeFile(
  join(outDir, "after.snapshot.txt"),
  JSON.stringify(afterSnap, null, 2),
);

await page.evaluate(() => cancelAnimationFrame(window.__marqueeRaf));
const log = await page.evaluate(() => window.__marqueeLog);
const nearSeam = log.filter((row) => row.t >= 29_400 && row.t <= 30_600);

await writeFile(join(outDir, "position-log.json"), JSON.stringify(log, null, 2));
await writeFile(
  join(outDir, "seam-samples.json"),
  JSON.stringify({ seamSamples, nearSeam }, null, 2),
);
await writeFile(join(outDir, "frame-timing.json"), JSON.stringify(frameMeta, null, 2));

const version = await browser.version();
const metadata = [
  `phase: ${phase}`,
  `url: ${url}`,
  `browser: ${version}`,
  `viewport: ${viewport.width}x${viewport.height}`,
  `dpr: ${dpr}`,
  `colorScheme: light`,
  `prefers-reduced-motion: no-preference`,
  `t0: overlays hidden, two rAFs after fonts.ready + networkidle`,
  `frames: 0-1000ms and 29500-31000ms at 100ms intended interval`,
  `screenshotTiming: ${JSON.stringify(screenshotMeta)}`,
  `capturedAt: ${new Date().toISOString()}`,
].join("\n");
await writeFile(join(outDir, "capture-metadata.txt"), `${metadata}\n`);

await context.close();
await browser.close();
console.log(`Wrote ${phase} capture to ${outDir} (${frameMeta.length} frames)`);
