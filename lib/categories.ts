export const CATEGORY_SLUGS = [
  "running",
  "training",
  "lifestyle",
  "basketball",
  "football",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORY_DISPLAY: Record<CategorySlug, string> = {
  running: "Running",
  training: "Training",
  lifestyle: "Lifestyle",
  basketball: "Basketball",
  football: "Football",
};

// ─── Page archetypes for differentiated benchmark testing ─────────
export type CategoryArchetype = "image-heavy" | "text-heavy" | "thumbnail-grid" | "minimal" | "standard";

export const CATEGORY_ARCHETYPE: Record<CategorySlug, CategoryArchetype> = {
  running: "image-heavy",
  training: "text-heavy",
  lifestyle: "thumbnail-grid",
  basketball: "minimal",
  football: "standard",
};

// ─── Hero images ─────────────────────────────────────────────────
export const CATEGORY_HEROES: Record<
  CategorySlug,
  { url: string; alt: string; tagline: string; subtitle: string }
> = {
  running: {
    url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=100&w=3000&auto=format&fit=crop",
    alt: "Runner sprinting on a track at sunset",
    tagline: "Born to Run.",
    subtitle:
      "From 5K to ultra-marathon — engineered cushioning and carbon-plate technology for every distance.",
  },
  training: {
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=100&w=3000&auto=format&fit=crop",
    alt: "Athlete training in a modern gym",
    tagline: "Train Without Limits.",
    subtitle:
      "Stable platforms, breathable uppers, and grip that holds on any surface. Built for the grind.",
  },
  lifestyle: {
    url: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop",
    alt: "Stylish sneakers on display",
    tagline: "Street Ready.",
    subtitle:
      "Iconic silhouettes meet modern comfort. From the court to the café, every step makes a statement.",
  },
  basketball: {
    url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=100&w=3000&auto=format&fit=crop",
    alt: "Basketball court under stadium lights",
    tagline: "Dominate the Court.",
    subtitle:
      "High-top support, responsive cushioning, and lockdown fit — built for explosive moves.",
  },
  football: {
    url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=100&w=3000&auto=format&fit=crop",
    alt: "Football pitch with stadium backdrop",
    tagline: "Control the Pitch.",
    subtitle:
      "Precision-engineered studs, lightweight uppers, and touch zones for complete ball control.",
  },
};

// ─── Gallery images for image-heavy archetype (Running) ──────────
export const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&auto=format&fit=crop", alt: "Runner at sunset" },
  { url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop", alt: "Trail running in mountains" },
  { url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop", alt: "Marathon finish line" },
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop", alt: "Running shoes close-up" },
  { url: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&auto=format&fit=crop", alt: "Morning jog in the park" },
  { url: "https://images.unsplash.com/photo-1590333748338-d629e4564ad9?w=800&auto=format&fit=crop", alt: "Cross country running" },
];

// ─── Content blocks for text-heavy archetype (Training) ──────────
export const TRAINING_GUIDE = {
  title: "The Complete Training Shoe Guide",
  intro: "Choosing the right training shoe can make or break your workout. Whether you're lifting heavy, doing HIIT, or pushing through a CrossFit WOD, the right footwear provides the foundation for every movement.",
  sections: [
    {
      heading: "Stability for Lifting",
      body: "A flat, firm sole is essential for heavy compound lifts like squats and deadlifts. Look for shoes with a wide base, minimal heel-to-toe drop, and a hard midsole that won't compress under load. The ideal training shoe distributes force evenly across the foot, allowing you to drive through the floor with maximum power transfer. Avoid running shoes for lifting — their soft, cushioned midsoles absorb energy that should go into the barbell, reducing your effective force output by up to 15%.",
    },
    {
      heading: "Versatility for HIIT",
      body: "High-intensity interval training demands a shoe that can handle lateral movements, box jumps, and short sprints. A good HIIT shoe combines lightweight cushioning with a supportive upper that locks the foot in place during multi-directional movement. The outsole should feature a multi-surface tread pattern that grips both rubber gym floors and outdoor surfaces. Breathability is critical — mesh uppers with reinforced zones allow airflow while maintaining structural integrity during explosive movements.",
    },
    {
      heading: "Durability for CrossFit",
      body: "CrossFit athletes put extraordinary demands on their footwear. A single WOD might include rope climbs, Olympic lifts, running, and box jumps. The ideal CrossFit shoe features a reinforced heel counter for stability under load, a rope guard on the midfoot to prevent abrasion, and a flexible forefoot that allows natural toe splay during dynamic movements. The outsole should be flat enough for lifting but cushioned enough for short runs — a compromise that defines the modern cross-training category.",
    },
    {
      heading: "Fit and Sizing",
      body: "Training shoes should fit snugly but not tightly. You want approximately a thumb's width of space between your longest toe and the front of the shoe. The heel should lock in without slipping, and the midfoot should feel secure without creating pressure points. Many athletes prefer a half-size down from their running shoe size, as training shoes tend to have a wider, more accommodating toe box. Always try shoes on with the socks you'll train in, and lace them fully before testing lateral movements.",
    },
  ],
  specs: [
    { label: "Heel-to-Toe Drop", running: "10-12mm", training: "0-4mm", lifestyle: "8-10mm" },
    { label: "Midsole Firmness", running: "Soft (EVA)", training: "Firm (TPU)", lifestyle: "Medium" },
    { label: "Weight (UK 9)", running: "250-300g", training: "300-350g", lifestyle: "350-400g" },
    { label: "Outsole Pattern", running: "Linear lugs", training: "Multi-directional", lifestyle: "Flat" },
    { label: "Upper Material", running: "Engineered mesh", training: "Reinforced mesh", lifestyle: "Leather/suede" },
    { label: "Best For", running: "Forward motion", training: "Multi-directional", lifestyle: "All-day wear" },
  ],
  reviews: [
    { author: "Jake M.", rating: 5, text: "These are hands down the best training shoes I've owned. Stable for deadlifts, comfortable for box jumps, and they look great too. The rope guard has already saved them from shredding during rope climbs." },
    { author: "Sarah K.", rating: 4, text: "Great all-round shoe for my CrossFit classes. Only downside is they run a little warm during longer cardio sessions, but the stability during lifting more than makes up for it." },
    { author: "Tom R.", rating: 5, text: "After years of wearing running shoes to the gym, switching to proper training shoes was a revelation. My squat immediately felt more stable and my balance during single-leg work improved dramatically." },
    { author: "Emma L.", rating: 4, text: "Perfect for HIIT classes. They're light enough for burpees and sprints but supportive enough for weighted exercises. The grip is excellent on the gym floor." },
  ],
};
