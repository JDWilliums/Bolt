#!/usr/bin/env npx tsx
/**
 * Bolt Benchmark Script
 *
 * Runs Lighthouse programmatically against all 4 stages across multiple
 * network profiles, collects Core Web Vitals, trims outliers, computes
 * medians, and outputs CSV files ready for the dissertation tables.
 *
 * METHODOLOGY: Uses round-robin ordering to mitigate temporal bias.
 * Instead of running 10 iterations of the same URL back-to-back,
 * each round cycles through ALL URLs once. This spreads measurements
 * across the full benchmark duration so a temporary server hiccup
 * affects at most 1 run per URL, not an entire batch.
 *
 * Usage:
 *   npm run benchmark                          # 10 iterations, all stages, ALL network profiles
 *   npm run benchmark:fast                     # 1 iteration per URL, all stages, all profiles
 *   npm run benchmark:quick                    # 3 iterations, all stages, all profiles
 *   npm run benchmark:nodelay                  # all profiles, no artificial delays (needs build:nodelay first)
 *
 *   # Custom:
 *   npm run benchmark -- --iterations 5
 *   npm run benchmark -- --profile slow3g
 *   npm run benchmark -- --profile all         # run all 4 network profiles
 *   npm run benchmark -- --stage control,rsc   # only specific stages
 *   npm run benchmark -- --stage all           # all 4 stages (default)
 *   npm run benchmark -- --base https://bolt.codebyjack.dev
 */

import * as chromeLauncher from "chrome-launcher";
import * as fs from "fs";
import * as path from "path";
import {
  STAGES,
  ALL_STAGES,
  ALL_PROFILES,
  NETWORK_PROFILES,
  getStageURLs,
  getLighthouseFlags,
  type StageName,
  type NetworkProfile,
} from "./lighthouse-config";

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

// Parse --stage flag
function parseStages(): StageName[] {
  const stageArg = getArg("stage", "all");
  if (stageArg === "all") return [...ALL_STAGES];
  return stageArg.split(",").map((s) => s.trim() as StageName);
}

// Parse --profile flag
function parseProfiles(): NetworkProfile[] {
  const profileArg = getArg("profile", "all");
  if (profileArg === "all") return [...ALL_PROFILES];
  return profileArg.split(",").map((p) => p.trim() as NetworkProfile);
}

const stages = parseStages();
const profiles = parseProfiles();

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
  stage: StageName;
  profile: NetworkProfile;
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
  if (values.length <= 2) return values; // Can't trim with <=2 values
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

function pctChange(oldVal: number, newVal: number): string {
  if (oldVal === 0) return "N/A";
  const pct = Math.round(((newVal - oldVal) / oldVal) * 100);
  return `${pct}%`;
}

const RESET = "\x1b[0m";

// ─── Lighthouse Runner ───────────────────────────────────────────
async function runLighthouse(
  url: string,
  port: number,
  profile: NetworkProfile
): Promise<RunMetrics> {
  const lighthouse = (await import("lighthouse")).default;
  const flags = getLighthouseFlags(profile);

  // Raise Lighthouse's navigation timeout from the default 45s to 120s.
  // The unoptimised Control storefront under Slow 3G can take well over
  // 60 seconds to reach a quiescent network state because it downloads
  // fifty 3000px unoptimised JPEGs over a 400 kbps pipe. A 45s timeout
  // silently kills those runs and causes gaps in the results table, so
  // we extend the ceiling to 120s to ensure the worst-case baseline is
  // actually measurable. This change affects all profiles and stages
  // for consistency; faster stages still complete well within the old
  // default and are unaffected.
  const config = {
    extends: "lighthouse:default",
    settings: {
      maxWaitForLoad: 120000,
    },
  };

  const result = await lighthouse(url, { ...flags, port }, config);

  if (!result || !result.lhr) {
    throw new Error(`Lighthouse failed for ${url}`);
  }

  const { lhr } = result;

  if (lhr.finalDisplayedUrl?.includes("chrome-error")) {
    throw new Error(`Page unreachable: ${url} — is the server running?`);
  }

  if (lhr.categories?.performance?.score === null) {
    throw new Error(`Lighthouse could not score ${url} — page may have errored`);
  }

  const audits = lhr.audits;

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
    LCP_ms: Math.round(audits["largest-contentful-paint"]?.numericValue ?? 0),
    TBT_ms: Math.round(audits["total-blocking-time"]?.numericValue ?? 0),
    CLS:
      Math.round(
        (audits["cumulative-layout-shift"]?.numericValue ?? 0) * 1000
      ) / 1000,
    SI_ms: Math.round(audits["speed-index"]?.numericValue ?? 0),
    TTFB_ms: Math.round(audits["server-response-time"]?.numericValue ?? 0),
    JS_KB: jsKB,
    PageWeight_KB: totalKB,
  };
}

// ─── CSV Writers ─────────────────────────────────────────────────
function writeSummaryCSV(results: URLResult[]) {
  const header =
    "Stage,Profile,URL,Label,FCP_ms,LCP_ms,TBT_ms,CLS,SI_ms,TTFB_ms,JS_KB,PageWeight_KB";
  const rows = results.map((r) => {
    const m = r.median;
    return `${r.stage},${r.profile},${r.url},${r.label},${m.FCP_ms},${m.LCP_ms},${m.TBT_ms},${m.CLS},${m.SI_ms},${m.TTFB_ms},${m.JS_KB},${m.PageWeight_KB}`;
  });

  const csvPath = path.join(RESULTS_DIR, "summary.csv");
  fs.writeFileSync(csvPath, [header, ...rows].join("\n"));
  console.log(`\nWrote ${csvPath}`);
}

function writeComparisonCSV(results: URLResult[]) {
  const metricKeys: (keyof RunMetrics)[] = [
    "FCP_ms", "LCP_ms", "TBT_ms", "CLS", "SI_ms", "TTFB_ms", "JS_KB", "PageWeight_KB",
  ];

  const headerParts = ["Page", "Profile"];
  for (const stage of stages) {
    for (const key of metricKeys) {
      headerParts.push(`${stage}_${key}`);
    }
  }
  const header = headerParts.join(",");

  const rows: string[] = [];

  for (const profile of profiles) {
    const refStage = stages[0];
    const refResults = results.filter(
      (r) => r.stage === refStage && r.profile === profile
    );

    for (const ref of refResults) {
      const parts: string[] = [ref.label, profile];

      for (const stage of stages) {
        const stageResult = results.find(
          (r) =>
            r.stage === stage &&
            r.profile === profile &&
            r.label === ref.label
        );
        for (const key of metricKeys) {
          parts.push(stageResult ? String(stageResult.median[key]) : "N/A");
        }
      }
      rows.push(parts.join(","));
    }
  }

  const csvPath = path.join(RESULTS_DIR, "comparison.csv");
  fs.writeFileSync(csvPath, [header, ...rows].join("\n"));
  console.log(`Wrote ${csvPath}`);
}

function writeMatrixCSV(results: URLResult[]) {
  const keyMetrics: (keyof RunMetrics)[] = ["FCP_ms", "LCP_ms", "TBT_ms", "CLS", "SI_ms"];

  const headerParts = ["Page", "Profile"];
  for (const stage of stages) {
    for (const metric of keyMetrics) {
      headerParts.push(`${stage}_${metric}`);
    }
  }
  if (stages.includes("control")) {
    for (const stage of stages.filter((s) => s !== "control")) {
      headerParts.push(`${stage}_vs_control_LCP_%`, `${stage}_vs_control_TBT_%`);
    }
  }

  const header = headerParts.join(",");
  const rows: string[] = [];

  for (const profile of profiles) {
    const controlResults = results.filter(
      (r) => r.stage === "control" && r.profile === profile
    );

    for (const ctrl of controlResults) {
      const parts: string[] = [ctrl.label, profile];

      for (const stage of stages) {
        const r = results.find(
          (x) => x.stage === stage && x.profile === profile && x.label === ctrl.label
        );
        for (const metric of keyMetrics) {
          parts.push(r ? String(r.median[metric]) : "N/A");
        }
      }

      if (stages.includes("control")) {
        for (const stage of stages.filter((s) => s !== "control")) {
          const r = results.find(
            (x) => x.stage === stage && x.profile === profile && x.label === ctrl.label
          );
          if (r) {
            parts.push(
              pctChange(ctrl.median.LCP_ms, r.median.LCP_ms),
              pctChange(ctrl.median.TBT_ms, r.median.TBT_ms)
            );
          } else {
            parts.push("N/A", "N/A");
          }
        }
      }

      rows.push(parts.join(","));
    }
  }

  const csvPath = path.join(RESULTS_DIR, "matrix.csv");
  fs.writeFileSync(csvPath, [header, ...rows].join("\n"));
  console.log(`Wrote ${csvPath}`);
}

// ─── Console output ──────────────────────────────────────────────
function printComparisonTable(results: URLResult[]) {
  for (const profile of profiles) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`  ${NETWORK_PROFILES[profile].name.toUpperCase()} COMPARISON`);
    console.log("=".repeat(80));

    const stageHeaders = stages.map((s) => STAGES[s].name.substring(0, 14).padStart(16)).join("");
    console.log(`${"Page".padEnd(20)}${"Metric".padEnd(8)}${stageHeaders}`);
    console.log("-".repeat(20 + 8 + stages.length * 16));

    // Build the list of pages to display for this profile. Previously
    // this was anchored to successful Control rows, which caused the
    // entire row to disappear whenever Control failed to measure —
    // even if every other stage succeeded for that same page. We now
    // union the labels from every stage that produced at least one
    // successful measurement for this profile, preserving the
    // canonical page ordering defined in lighthouse-config.ts.
    const pageLabelsInOrder: string[] = [];
    const seenLabels = new Set<string>();
    for (const r of results) {
      if (r.profile !== profile) continue;
      if (seenLabels.has(r.label)) continue;
      seenLabels.add(r.label);
      pageLabelsInOrder.push(r.label);
    }

    for (const label of pageLabelsInOrder) {
      const metricsToShow: { key: keyof RunMetrics; label: string }[] = [
        { key: "LCP_ms", label: "LCP" },
        { key: "TBT_ms", label: "TBT" },
        { key: "CLS", label: "CLS" },
        { key: "SI_ms", label: "SI" },
      ];

      for (let mi = 0; mi < metricsToShow.length; mi++) {
        const { key, label: metricLabel } = metricsToShow[mi];
        const pageName = mi === 0 ? label : "";

        const values = stages.map((stage) => {
          const r = results.find(
            (x) => x.stage === stage && x.profile === profile && x.label === label
          );
          if (!r) return "N/A".padStart(16);

          const val = r.median[key];
          const unit = key === "CLS" ? "" : "ms";
          const formatted = key === "CLS" ? val.toFixed(3) : String(val);

          if (stage !== "control" && stages.includes("control")) {
            const ctrl = results.find(
              (x) => x.stage === "control" && x.profile === profile && x.label === label
            );
            if (ctrl && ctrl.median[key] !== 0) {
              const delta = pctChange(ctrl.median[key], val);
              return `${formatted}${unit}(${delta})`.padStart(16);
            }
          }
          return `${formatted}${unit}`.padStart(16);
        });

        console.log(`${pageName.padEnd(20)}${metricLabel.padEnd(8)}${values.join("")}`);
      }
      console.log("-".repeat(20 + 8 + stages.length * 16));
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  // ──────────────────────────────────────────────────────────────
  // Build the flat list of test targets (profile × stage × page).
  // Each target will be run once per round in round-robin order.
  // ──────────────────────────────────────────────────────────────
  interface TestTarget {
    profile: NetworkProfile;
    stage: StageName;
    urlPath: string;
    label: string;
  }

  const targets: TestTarget[] = [];
  for (const profile of profiles) {
    for (const stage of stages) {
      for (const { path: urlPath, label } of getStageURLs(stage)) {
        targets.push({ profile, stage, urlPath, label });
      }
    }
  }

  const totalRuns = targets.length * ITERATIONS;

  console.log("=".repeat(60));
  console.log("  BOLT BENCHMARK — Dissertation Performance Measurement");
  console.log("=".repeat(60));
  console.log(`  Base URL:    ${BASE_URL}`);
  console.log(`  Iterations:  ${ITERATIONS}`);
  console.log(`  Ordering:    Round-robin (temporal bias mitigation)`);
  console.log(`  Stages:      ${stages.map((s) => STAGES[s].name).join(", ")}`);
  console.log(`  Profiles:    ${profiles.map((p) => NETWORK_PROFILES[p].name).join(", ")}`);
  console.log(`  URLs/round:  ${targets.length} (${stages.length} stages x ${profiles.length} profiles x 8 pages)`);
  console.log(`  Total runs:  ${totalRuns}`);
  console.log(`  Est. time:   ~${Math.round((totalRuns * 25) / 60)} min`);
  console.log("=".repeat(60));

  fs.mkdirSync(RAW_DIR, { recursive: true });

  console.log("\nLaunching Chrome...");
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });
  console.log(`Chrome running on port ${chrome.port}\n`);

  // Accumulate runs per target — keyed by "profile|stage|urlPath"
  const runsMap = new Map<string, { target: TestTarget; runs: RunMetrics[] }>();
  for (const t of targets) {
    runsMap.set(`${t.profile}|${t.stage}|${t.urlPath}`, {
      target: t,
      runs: [],
    });
  }

  // ──────────────────────────────────────────────────────────────
  // ROUND-ROBIN EXECUTION
  //
  // Each round tests every URL once, cycling through all stages
  // and network profiles. This spreads measurements across the
  // full benchmark duration, so a temporary server hiccup (DB
  // cold-start, GC pause, Neon wake-up) affects at most 1 run
  // per URL rather than contaminating an entire sequential batch.
  //
  // For N=10 iterations across 32 URLs, the old approach would
  // test URL #1 ten times in ~4 minutes, then move to URL #2.
  // The round-robin approach tests all 32 URLs once (~13 min),
  // then repeats — spreading URL #1's measurements across the
  // full ~2 hour window.
  // ──────────────────────────────────────────────────────────────
  let completedRuns = 0;
  const startTime = Date.now();

  for (let round = 1; round <= ITERATIONS; round++) {
    const elapsed = Date.now() - startTime;
    const rate = completedRuns > 0 ? elapsed / completedRuns : 25000;
    const remaining = Math.round(((totalRuns - completedRuns) * rate) / 60000);

    console.log(`\n${"#".repeat(60)}`);
    console.log(
      `  ROUND ${round} of ${ITERATIONS} — ${targets.length} URLs — ~${remaining} min remaining`
    );
    console.log(`${"#".repeat(60)}`);

    for (const t of targets) {
      const fullUrl = `${BASE_URL}${t.urlPath}`;
      const key = `${t.profile}|${t.stage}|${t.urlPath}`;
      const slug = `${t.profile}-${slugify(t.urlPath)}`;
      const stageColor = STAGES[t.stage].color;
      const profileName = NETWORK_PROFILES[t.profile].name.padEnd(14);

      completedRuns++;
      const pct = Math.round((completedRuns / totalRuns) * 100);

      process.stdout.write(
        `  [${String(pct).padStart(3)}%] ${stageColor}${t.stage.padEnd(10)}${RESET} ${profileName} ${t.label.padEnd(20)} `
      );

      try {
        const metrics = await runLighthouse(fullUrl, chrome.port, t.profile);
        runsMap.get(key)!.runs.push(metrics);

        const rawPath = path.join(RAW_DIR, `${slug}-run-${round}.json`);
        fs.writeFileSync(rawPath, JSON.stringify(metrics, null, 2));

        console.log(
          `LCP=${String(metrics.LCP_ms).padStart(6)}ms  TBT=${String(metrics.TBT_ms).padStart(5)}ms  CLS=${metrics.CLS}`
        );
      } catch (error) {
        console.log(
          `FAILED: ${error instanceof Error ? error.message : error}`
        );
      }
    }
  }

  await chrome.kill();

  const totalTime = Math.round((Date.now() - startTime) / 60000);
  console.log(`\nBenchmark completed in ${totalTime} minutes.`);

  // Compute medians and build results
  const allResults: URLResult[] = [];
  for (const { target, runs } of runsMap.values()) {
    if (runs.length === 0) {
      console.warn(
        `  Warning: No successful runs for ${target.stage} ${target.profile} ${target.urlPath}`
      );
      continue;
    }

    allResults.push({
      url: target.urlPath,
      label: target.label,
      stage: target.stage,
      profile: target.profile,
      runs,
      median: computeMedian(runs),
    });
  }

  // Write CSV files
  console.log("\n" + "=".repeat(60));
  console.log("  GENERATING REPORTS");
  console.log("=".repeat(60));

  writeSummaryCSV(allResults);
  writeComparisonCSV(allResults);
  writeMatrixCSV(allResults);

  // Print comparison table
  printComparisonTable(allResults);

  console.log("\n" + "=".repeat(60));
  console.log(`  Results saved to: ${RESULTS_DIR}/`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
