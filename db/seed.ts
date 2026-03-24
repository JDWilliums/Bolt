import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Base products with intentionally HEAVY, unoptimized image URLs
const baseProducts = [
  {
    name: "Air Max Zenith",
    description: "Maximum cushioning for urban running and all-day comfort.",
    price: 15000, // £150.00 (stored in pence)
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=100&w=3000&auto=format&fit=crop", 
  },
  {
    name: "React Phantom",
    description: "Lightweight, breathable, and designed for speed.",
    price: 13500,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Dunk Low Retro",
    description: "Classic court style redesigned for the modern street.",
    price: 11000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "ZoomX Invincible",
    description: "High-response foam returns energy with every step you take.",
    price: 18000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Metcon 8X",
    description: "Stable and durable for the most grueling workout sessions.",
    price: 14000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Blazer Mid '77",
    description: "Vintage hoops style with a timeless finish.",
    price: 10500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=100&w=3000&auto=format&fit=crop",
  }
];

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Optional: Clear existing data to start fresh (uncomment if needed later)
    // await db.delete(products);
    // console.log("🗑️ Cleared existing products.");

    // Duplicate the base products to create a realistic grid size (24 products)
    const payload = [];
    for (let i = 0; i < 4; i++) {
      payload.push(...baseProducts.map(p => ({
        ...p,
        // Append a unique ID to the name to differentiate duplicates visually
        name: `${p.name} v${i + 1}` 
      })));
    }

    await db.insert(products).values(payload);
    console.log(`✅ Successfully seeded ${payload.length} products!`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

main();