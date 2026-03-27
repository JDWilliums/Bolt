/**
 * Shared Lighthouse configuration for the Bolt dissertation.
 *
 * Supports 4 stages (Control, Image Opt, RSC, Full) across 3 network
 * profiles (Slow 3G, Fast 3G, 4G). This matches the test conditions
 * described in Section 3.4 of the dissertation methodology.
 */

// ─── Page definitions (shared across all stages) ─────────────────
const PAGES = [
  { slug: "", label: "Homepage" },
  { slug: "/category/running", label: "Category/Running" },
  { slug: "/category/training", label: "Category/Training" },
  { slug: "/category/lifestyle", label: "Category/Lifestyle" },
  { slug: "/category/basketball", label: "Category/Basketball" },
  { slug: "/category/football", label: "Category/Football" },
  { slug: "/cart", label: "Cart" },
  { slug: "/product/25", label: "Product Detail" },
] as const;

// ─── Stage definitions ───────────────────────────────────────────
export const STAGES = {
  control: {
    name: "Control (Legacy CSR)",
    basePath: "/control/legacy",
    color: "\x1b[31m", // red
  },
  "image-opt": {
    name: "Stage A (Image Optimised)",
    basePath: "/experimental/image-opt",
    color: "\x1b[33m", // yellow/orange
  },
  rsc: {
    name: "Stage B (Server Components)",
    basePath: "/experimental/rsc",
    color: "\x1b[34m", // blue
  },
  modern: {
    name: "Stage C (Fully Optimised)",
    basePath: "/experimental/modern",
    color: "\x1b[32m", // green
  },
} as const;

export type StageName = keyof typeof STAGES;
export const ALL_STAGES: StageName[] = ["control", "image-opt", "rsc", "modern"];

// Build URLs for a given stage
export function getStageURLs(stage: StageName) {
  const { basePath } = STAGES[stage];
  return PAGES.map((page) => ({
    path: `${basePath}${page.slug}`,
    label: page.label,
  }));
}

// ─── Network profiles ────────────────────────────────────────────
export const NETWORK_PROFILES = {
  none: {
    name: "No Throttling",
    throttling: {
      rttMs: 0,
      throughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
    },
  },
  "4g": {
    name: "4G",
    throttling: {
      rttMs: 170,
      throughputKbps: 9000,
      uploadThroughputKbps: 9000,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
    },
  },
  fast3g: {
    name: "Fast 3G",
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      uploadThroughputKbps: 675,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
    },
  },
  slow3g: {
    name: "Slow 3G",
    throttling: {
      rttMs: 400,
      throughputKbps: 400,
      uploadThroughputKbps: 400,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
    },
  },
} as const;

export type NetworkProfile = keyof typeof NETWORK_PROFILES;
export const ALL_PROFILES: NetworkProfile[] = ["none", "4g", "fast3g", "slow3g"];

// Metrics to extract from each Lighthouse run
export const METRICS = [
  { key: "first-contentful-paint", csv: "FCP_ms", unit: "ms" },
  { key: "largest-contentful-paint", csv: "LCP_ms", unit: "ms" },
  { key: "total-blocking-time", csv: "TBT_ms", unit: "ms" },
  { key: "cumulative-layout-shift", csv: "CLS", unit: "score" },
  { key: "speed-index", csv: "SI_ms", unit: "ms" },
] as const;

// Lighthouse flags — performance-only, mobile, simulated throttling
export function getLighthouseFlags(profile: NetworkProfile) {
  return {
    logLevel: "error" as const,
    output: "json" as const,
    onlyCategories: ["performance"],
    formFactor: "mobile" as const,
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    throttlingMethod: "simulate" as const,
    throttling: NETWORK_PROFILES[profile].throttling,
  };
}

// Legacy export for backwards compatibility
export const TEST_URLS = {
  control: getStageURLs("control"),
  experimental: getStageURLs("modern"),
};

export const LIGHTHOUSE_FLAGS = getLighthouseFlags("fast3g");
