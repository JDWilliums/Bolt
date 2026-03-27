/**
 * Shared Lighthouse configuration for the Bolt dissertation.
 *
 * Throttling profile: Simulated "Fast 3G" on a Moto G4-class device.
 * This matches the test conditions described in Section 3.4 of the
 * dissertation methodology.
 */

// All 16 testable URLs across both groups
export const TEST_URLS = {
  control: [
    { path: "/control/legacy", label: "Homepage" },
    { path: "/control/legacy/category/running", label: "Category/Running" },
    { path: "/control/legacy/category/training", label: "Category/Training" },
    { path: "/control/legacy/category/lifestyle", label: "Category/Lifestyle" },
    {
      path: "/control/legacy/category/basketball",
      label: "Category/Basketball",
    },
    { path: "/control/legacy/category/football", label: "Category/Football" },
    { path: "/control/legacy/cart", label: "Cart" },
    { path: "/control/legacy/product/1", label: "Product Detail" },
  ],
  experimental: [
    { path: "/experimental/modern", label: "Homepage" },
    {
      path: "/experimental/modern/category/running",
      label: "Category/Running",
    },
    {
      path: "/experimental/modern/category/training",
      label: "Category/Training",
    },
    {
      path: "/experimental/modern/category/lifestyle",
      label: "Category/Lifestyle",
    },
    {
      path: "/experimental/modern/category/basketball",
      label: "Category/Basketball",
    },
    {
      path: "/experimental/modern/category/football",
      label: "Category/Football",
    },
    { path: "/experimental/modern/cart", label: "Cart" },
    { path: "/experimental/modern/product/1", label: "Product Detail" },
  ],
};

// Metrics to extract from each Lighthouse run
export const METRICS = [
  { key: "first-contentful-paint", csv: "FCP_ms", unit: "ms" },
  { key: "largest-contentful-paint", csv: "LCP_ms", unit: "ms" },
  { key: "total-blocking-time", csv: "TBT_ms", unit: "ms" },
  { key: "cumulative-layout-shift", csv: "CLS", unit: "score" },
  { key: "speed-index", csv: "SI_ms", unit: "ms" },
] as const;

// Lighthouse flags — performance-only, mobile, simulated throttling
export const LIGHTHOUSE_FLAGS = {
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
  // Simulated Fast 3G throttling (Lighthouse default for mobile)
  throttlingMethod: "simulate" as const,
  throttling: {
    rttMs: 150, // Round trip time
    throughputKbps: 1638.4, // ~1.6 Mbps download
    uploadThroughputKbps: 675, // ~675 Kbps upload
    cpuSlowdownMultiplier: 4, // 4x CPU slowdown (Moto G4-class)
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
  },
};
