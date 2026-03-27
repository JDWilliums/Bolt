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
