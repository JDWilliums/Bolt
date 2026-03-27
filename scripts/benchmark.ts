#!/usr/bin/env npx tsx
/**
 * Bolt Benchmark Script
 *
 * Runs Lighthouse programmatically against all 16 URLs, collects Core Web
 * Vitals, trims outliers, computes medians, and outputs CSV files ready
 * for the dissertation's Chapter 5 tables.
 *
 * Usage:
 *   npm run benchmark                                           # 10 iterations, localhost
 *   npm run benchmark -- --iterations 3                         # quick 3-run test
 *   npm run benchmark -- --base https://bolt.codebyjack.dev    # test live Vercel deployment
 */

import * as chromeLauncher from "chrome-launcher";
import * as fs from "fs";
import * as path from "path";
import { TEST_URLS, METRICS, LIGHTHOUSE_FLAGS } from "./lighthouse-config";

// ─── CLI Args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const BASE_URL = getArg("base", "http://localhost:3000");
const ITERATIONS = parseInt(getArg("iterations", "10"), 10);
const RESULTS_DIR = path.join(__dirname, "..", "results");
const RAW_DIR = path.join(RESULTS_DIR, "raw");

// ─── Types ───────────────────────────────────────────────────────
interface RunMetrics {
  FCP_ms: number;
  LCP_ms: number;
  TBT_ms: number;
  CLS: number;
  SI_ms: number;
  TTFB_ms: number;
  JS_KB: number;
  PageWeight_KB: number;
}

interface URLResult {
  url: string;
  label: string;
  group: "control" | "experimental";
  runs: RunMetrics[];
  median: RunMetrics;
}

// ─── Helpers ─────────────────────────────────────────────────────
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function trimOutliers(values: number[]): number[] {
  // Discard top and bottom 10% (per dissertation Section 3.6)
  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * 0.1);
  return sorted.slice(trimCount, sorted.length - trimCount);
}

function computeMedian(runs: RunMetrics[]): RunMetrics {
  const keys = Object.keys(runs[0]) as (keyof RunMetrics)[];
  const result = {} as RunMetrics;

  for (const key of keys) {
    const allValues = runs.map((r) => r[key]);
    const trimmed = trimOutliers(allValues);
    result[key] = Math.round(median(trimmed) * 1000) / 1000;
  }

  return result;
}

function slugify(urlPath: string): string {
  return urlPath.replace(/^\//, "").replace(/\//g, "-") || "root";
}

// ─── Lighthouse Runner ───────────────────────────────────────────
async function runLighthouse(
  url: string,
  port: number
): Promise<RunMetrics> {
  // Dynamic import for ESM-only lighthouse
  const lighthouse = (await import("lighthouse")).default;

  const result = await lighthouse(url, {
    ...LIGHTHOUSE_FLAGS,
    port,
  });

  if (!result || !result.lhr) {
    throw new Error(`Lighthouse failed for ${url}`);
  }

  const { lhr } = result;

  // Detect if the page actually loaded
  if (lhr.finalDisplayedUrl?.includes("chrome-error")) {
    throw new Error(`Page unreachable: ${url} — is the server running?`);
  }

  if (lhr.categories?.performance?.score === null) {
    throw new Error(`Lighthouse could not score ${url} — page may have errored`);
  }

  const audits = lhr.audits;

  // Extract transfer sizes from network records
  const resourceSummary = audits["resource-summary"]?.details;
  let jsKB = 0;
  let totalKB = 0;

  if (resourceSummary && "items" in resourceSummary) {
    const items = resourceSummary.items as Array<{
      resourceType: string;
      transferSize: number;
    }>;
    const jsItem = items.find((i) => i.resourceType === "script");
    const totalItem = items.find((i) => i.resourceType === "total");
    jsKB = jsItem ? Math.round(jsItem.transferSize / 1024) : 0;
    totalKB = totalItem ? Math.round(totalItem.transferSize / 1024) : 0;
  }

  return {
    FCP_ms: Math.round(audits["first-contentful-paint"]?.numericValue ?? 0),
    LCP_ms: Math.round(
      audits["largest-contentful-paint"]?.numericValue ?? 0
    ),
    TBT_ms: Math.round(audits["total-blocking-time"]?.numericValue ?? 0),
    CLS: Math.round(
      (audits["cumulative-layout-shift"]?.numericValue ?? 0) * 1000
    ) / 1000,
    SI_ms: Math.round(audits["speed-index"]?.numericValue ?? 0),
    TTFB_ms: Math.round(
      audits["server-response-time"]?.numericValue ?? 0
    ),
    JS_KB: jsKB,
    PageWeight_KB: totalKB,
  };
}

// ─── CSV Writers ─────────────────────────────────────────────────
function writeSummaryCSV(results: URLResult[]) {
  const header =
    "URL,Group,Label,FCP_ms,LCP_ms,TBT_ms,CLS,SI_ms,TTFB_ms,JS_KB,PageWeight_KB";
  const rows = results.map((r) => {
    const m = r.median;
    return `${r.url},${r.group},${r.label},${m.FCP_ms},${m.LCP_ms},${m.TBT_ms},${m.CLS},${m.SI_ms},${m.TTFB_ms},${m.JS_KB},${m.PageWeight_KB}`;
  });

  const csvPath = path.join(RESULTS_DIR, "summary.csv");
  fs.writeFileSync(csvPath, [header, ...rows].join("\n"));
  console.log(`\nWrote ${csvPath}`);
}

function writeComparisonCSV(results: URLResult[]) {
  const controlResults = results.filter((r) => r.group === "control");
  const experimentalResults = results.filter(
    (r) => r.group === "experimental"
  );

  const metricKeys: (keyof RunMetrics)[] = [
    "FCP_ms",
    "LCP_ms",
    "TBT_ms",
    "CLS",
    "SI_ms",
    "TTFB_ms",
    "JS_KB",
    "PageWeight_KB",
  ];

  // Header
  const headerParts = ["Page"];
  for (const key of metricKeys) {
    headerParts.push(`Control_${key}`, `Experimental_${key}`, `Delta_${key}`);
  }
  const header = headerParts.join(",");

  // Rows — match by label
  const rows: string[] = [];
  for (const ctrl of controlResults) {
    const exp = experimentalResults.find((e) => e.label === ctrl.label);
    if (!exp) continue;

    const parts: string[] = [ctrl.label];
    for (const key of metricKeys) {
      const cVal = ctrl.median[key];
      const eVal = exp.median[key];
      const delta =
        cVal === 0 ? "N/A" : `${Math.round(((eVal - cVal) / cVal) * 100)}%`;
      parts.push(String(cVal), String(eVal), delta);
    }
    rows.push(parts.join(","));
  }

  const csvPath = path.join(RESULTS_DIR, "comparison.csv");
  fs.writeFileSync(csvPath, [header, ...rows].join("\n"));
  console.log(`Wrote ${csvPath}`);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("  BOLT BENCHMARK — Dissertation Performance Measurement");
  console.log("=".repeat(60));
  console.log(`  Base URL:    ${BASE_URL}`);
  console.log(`  Iterations:  ${ITERATIONS}`);
  console.log(`  Throttling:  Simulated Fast 3G (Mobile)`);
  console.log(`  Device:      Moto G4 (4x CPU slowdown)`);
  console.log(`  URLs:        ${TEST_URLS.control.length + TEST_URLS.experimental.length}`);
  console.log("=".repeat(60));

  // Ensure output directories exist
  fs.mkdirSync(RAW_DIR, { recursive: true });

  // Launch Chrome
  console.log("\nLaunching Chrome...");
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });
  console.log(`Chrome running on port ${chrome.port}\n`);

  const allResults: URLResult[] = [];

  // Run both groups
  for (const [group, urls] of Object.entries(TEST_URLS) as [
    "control" | "experimental",
    typeof TEST_URLS.control,
  ][]) {
    console.log(`\n--- ${group.toUpperCase()} GROUP ---\n`);

    for (const { path: urlPath, label } of urls) {
      const fullUrl = `${BASE_URL}${urlPath}`;
      const slug = slugify(urlPath);
      const runs: RunMetrics[] = [];

      process.stdout.write(`  ${label} (${urlPath}): `);

      for (let i = 1; i <= ITERATIONS; i++) {
        try {
          const metrics = await runLighthouse(fullUrl, chrome.port);
          runs.push(metrics);

          // Save raw JSON
          const rawPath = path.join(RAW_DIR, `${slug}-run-${i}.json`);
          fs.writeFileSync(rawPath, JSON.stringify(metrics, null, 2));

          process.stdout.write(`${i} `);
        } catch (error) {
          process.stdout.write(`x `);
          console.error(
            `\n    Run ${i} failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      if (runs.length === 0) {
        console.log("— ALL RUNS FAILED, skipping");
        continue;
      }

      const medianResult = computeMedian(runs);
      allResults.push({
        url: urlPath,
        label,
        group,
        runs,
        median: medianResult,
      });

      console.log(
        `\n    Median: LCP=${medianResult.LCP_ms}ms TBT=${medianResult.TBT_ms}ms CLS=${medianResult.CLS} SI=${medianResult.SI_ms}ms`
      );
    }
  }

  // Kill Chrome
  await chrome.kill();

  // Write CSV files
  console.log("\n" + "=".repeat(60));
  console.log("  GENERATING REPORTS");
  console.log("=".repeat(60));

  writeSummaryCSV(allResults);
  writeComparisonCSV(allResults);

  // Print comparison table to console
  console.log("\n" + "=".repeat(60));
  console.log("  COMPARISON TABLE (Control vs Experimental)");
  console.log("=".repeat(60));
  console.log(
    `${"Page".padEnd(22)} ${"LCP".padStart(12)} ${"TBT".padStart(12)} ${"CLS".padStart(12)} ${"SI".padStart(12)}`
  );
  console.log("-".repeat(72));

  const controlResults = allResults.filter((r) => r.group === "control");
  const experimentalResults = allResults.filter(
    (r) => r.group === "experimental"
  );

  for (const ctrl of controlResults) {
    const exp = experimentalResults.find((e) => e.label === ctrl.label);
    if (!exp) continue;

    const lcpDelta = Math.round(
      ((exp.median.LCP_ms - ctrl.median.LCP_ms) / ctrl.median.LCP_ms) * 100
    );
    const tbtDelta =
      ctrl.median.TBT_ms === 0
        ? "N/A"
        : `${Math.round(((exp.median.TBT_ms - ctrl.median.TBT_ms) / ctrl.median.TBT_ms) * 100)}%`;
    const clsDelta = `${ctrl.median.CLS} → ${exp.median.CLS}`;
    const siDelta = Math.round(
      ((exp.median.SI_ms - ctrl.median.SI_ms) / ctrl.median.SI_ms) * 100
    );

    console.log(
      `${ctrl.label.padEnd(22)} ${`${ctrl.median.LCP_ms}→${exp.median.LCP_ms} (${lcpDelta}%)`.padStart(12)} ${`${ctrl.median.TBT_ms}→${exp.median.TBT_ms} (${tbtDelta})`.padStart(12)} ${clsDelta.padStart(12)} ${`${ctrl.median.SI_ms}→${exp.median.SI_ms} (${siDelta}%)`.padStart(12)}`
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  Results saved to: ${RESULTS_DIR}/`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
