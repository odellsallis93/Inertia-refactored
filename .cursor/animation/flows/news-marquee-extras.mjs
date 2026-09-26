#!/usr/bin/env node
/**
 * Extra seam checks: mid-cycle resize and 667x375 landscape.
 * Usage: node .cursor/animation/flows/news-marquee-extras.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = join(repoRoot, ".cursor/artifacts/animations/news-marquee/migrated");
const url = process.env.MIGRATED_URL ?? "http://localhost:3000/about";

await mkdir(outDir, { recursive: true });

const hideOverlays = async (page) => {
  await page.waitForSelector("#scrollCol", { state: "attached" });
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
};

const startSampler = async (page) => {
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
      const track = document.querySelector(".marqueeTrack");
      return {
        t: performance.now() - window.__t0,
        cardCount: boxes.length,
        wrapperHeight: col?.getBoundingClientRect().height ?? 0,
        trackHeight: track?.getBoundingClientRect().height ?? 0,
        wrapperTransform: col ? getComputedStyle(col).transform : null,
        trackTransform: track ? getComputedStyle(track).transform : null,
        visibleSrcs,
        firstTop: boxes[0] ? Number(boxes[0].getBoundingClientRect().top.toFixed(3)) : null,
        seventhTop: boxes[6] ? Number(boxes[6].getBoundingClientRect().top.toFixed(3)) : null,
      };
    };
    window.__sampleMarquee = sample;
    const tick = () => {
      window.__marqueeLog.push(sample());
      window.__marqueeRaf = requestAnimationFrame(tick);
    };
    tick();
  });
};

const analyze = (log) => {
  const jumps = [];
  for (let i = 1; i < log.length; i += 1) {
    const prev = log[i - 1];
    const next = log[i];
    const dy = (next.firstTop ?? 0) - (prev.firstTop ?? 0);
    const dt = next.t - prev.t;
    const expected = dt > 0 && prev.trackHeight ? (-0.5 * prev.trackHeight * dt) / 30_000 : 0;
    const visChanged = JSON.stringify(prev.visibleSrcs) !== JSON.stringify(next.visibleSrcs);
    const wrapLike = dy > 200;
    if (wrapLike || (visChanged && Math.abs(dy) > 40)) {
      jumps.push({
        t0: prev.t,
        t1: next.t,
        firstTop0: prev.firstTop,
        firstTop1: next.firstTop,
        seventhTop0: prev.seventhTop,
        seventhTop1: next.seventhTop,
        dy,
        expectedFrameDy: expected,
        vis0: prev.visibleSrcs,
        vis1: next.visibleSrcs,
        wrapperHeight: next.wrapperHeight,
        trackHeight: next.trackHeight,
        wrapLike,
      });
    }
  }
  return {
    samples: log.length,
    cardCount: log[0]?.cardCount ?? 0,
    wrapperHeight: log[0]?.wrapperHeight ?? 0,
    trackHeight: log[0]?.trackHeight ?? 0,
    jumps,
    blankColumn: log.some((row) => (row.visibleSrcs?.length ?? 0) === 0),
  };
};

const only = process.argv[2] ?? "all";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--hide-scrollbars"],
});

const runUntil = async (page, ms) => {
  await page.waitForFunction(
    (target) => performance.now() - window.__t0 >= target,
    ms,
    { polling: 50, timeout: 45_000 },
  );
};

if (only === "all" || only === "resize") {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  await page.goto(url, { waitUntil: "networkidle" });
  await hideOverlays(page);
  await startSampler(page);
  await runUntil(page, 5_000);
  await page.setViewportSize({ width: 1024, height: 768 });
  await runUntil(page, 32_000);
  await page.evaluate(() => cancelAnimationFrame(window.__marqueeRaf));
  const log = await page.evaluate(() => window.__marqueeLog);
  const result = analyze(log);
  await page.screenshot({ path: join(outDir, "resize-after.png"), type: "png" });
  await writeFile(join(outDir, "resize-seam.json"), JSON.stringify({ ...result, logTail: log.slice(-20) }, null, 2));
  await context.close();
  console.log("resize extras", JSON.stringify({ jumps: result.jumps.length, blank: result.blankColumn, cards: result.cardCount }));
}

if (only === "all" || only === "landscape") {
  const context = await browser.newContext({
    viewport: { width: 667, height: 375 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  await page.goto(url, { waitUntil: "networkidle" });
  await hideOverlays(page);
  await startSampler(page);
  await runUntil(page, 32_000);
  await page.evaluate(() => cancelAnimationFrame(window.__marqueeRaf));
  const log = await page.evaluate(() => window.__marqueeLog);
  const computed = await page.evaluate(() => {
    const wrap = document.querySelector(".tiltFx--wrap1");
    const box = document.querySelector(".boxMarquee");
    return {
      wrapHeight: wrap ? getComputedStyle(wrap).height : null,
      boxHeight: box ? getComputedStyle(box).height : null,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
  });
  const result = analyze(log);
  await page.screenshot({ path: join(outDir, "landscape-after.png"), type: "png" });
  await writeFile(
    join(outDir, "landscape-seam.json"),
    JSON.stringify({ computed, ...result, logTail: log.slice(-20) }, null, 2),
  );
  await context.close();
  console.log("landscape extras", JSON.stringify({ jumps: result.jumps.length, blank: result.blankColumn, cards: result.cardCount, computed }));
}

await browser.close();
