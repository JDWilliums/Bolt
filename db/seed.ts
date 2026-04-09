import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// 50 products across 5 categories with intentionally HEAVY, unoptimised image URLs.
// All images are served at q=100 & w=3000 to simulate the common anti-pattern of
// content managers uploading raw, uncompressed assets — the experimental group's
// <Image> component will automatically optimise these at the edge.
const allProducts = [
  // ─── RUNNING (10) ──────────────────────────────────────────────
  {
    name: "Air Max Zenith",
    description: "Maximum cushioning meets breathable mesh for urban running and all-day comfort on any surface.",
    price: 15000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "ZoomX Invincible",
    description: "High-response ZoomX foam returns energy with every stride. Built for long-distance dominance.",
    price: 18000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Pegasus Ultra",
    description: "The workhorse of running shoes, redesigned with a wider toe box and plush React midsole.",
    price: 13000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Vaporfly Edge",
    description: "Carbon-fibre plate technology for race-day speed. Sub-two-hour marathon engineering.",
    price: 23000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "React Infinity",
    description: "Injury-reducing rocker geometry with a secure flyknit upper. Run further, hurt less.",
    price: 16000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Free Run Flyknit",
    description: "Barefoot flexibility with just enough cushion. The minimalist runner's go-to shoe.",
    price: 12000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Air Zoom Tempo",
    description: "Tempo-run specialist with a responsive forefoot Air unit and lightweight upper.",
    price: 17000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Alphafly Pro",
    description: "The fastest marathon shoe ever made. Atomknit 2.0 upper with dual Air Zoom pods.",
    price: 27500,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Structure 25",
    description: "Stability without compromise. Guide rails correct overpronation while keeping the ride smooth.",
    price: 14000,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Winflo Shield",
    description: "Water-repellent upper and reflective details for cold, wet winter runs.",
    price: 9500,
    category: "Running",
    imageUrl: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=100&w=3000&auto=format&fit=crop",
  },

  // ─── TRAINING (10) ─────────────────────────────────────────────
  {
    name: "Metcon 8X",
    description: "Flat, stable base for heavy lifts with rope-wrap durability for climbing workouts.",
    price: 14000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "React Phantom",
    description: "Lightweight and breathable trainer designed for HIIT circuits and agility drills.",
    price: 13500,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Free Metcon 5",
    description: "Flexible forefoot for sprints, stable heel for squats. The hybrid training shoe.",
    price: 11000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "SuperRep Surge",
    description: "Designed for dance-style HIIT with extra forefoot cushioning and pivot points.",
    price: 13000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Legend Essential",
    description: "Entry-level cross-trainer with soft foam and a durable rubber outsole.",
    price: 7000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Flex Experience",
    description: "Ultra-flexible grooves let your foot move naturally through every exercise.",
    price: 6500,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Renew Retaliation",
    description: "Plush Renew foam meets a rugged outsole for gym-to-street versatility.",
    price: 8500,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1603787081207-362bcef7c144?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Defy All Day",
    description: "All-day comfort trainer with extra ankle padding and arch support.",
    price: 7500,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Air Max Alpha",
    description: "Visible Air unit in the heel provides premium cushioning during plyometric training.",
    price: 10000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "MC Trainer 2",
    description: "Budget-friendly gym shoe with a wide flat base and durable mesh upper.",
    price: 8000,
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=100&w=3000&auto=format&fit=crop",
  },

  // ─── LIFESTYLE (10) ────────────────────────────────────────────
  {
    name: "Dunk Low Retro",
    description: "Classic court style redesigned for the modern street. Leather upper, padded collar.",
    price: 11000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Blazer Mid '77",
    description: "Vintage hoops silhouette with exposed foam on the tongue. A wardrobe essential.",
    price: 10500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Air Force 1 '07",
    description: "The icon. Crisp leather, Air-Sole cushioning, and over 40 years of street cred.",
    price: 11500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Cortez Classic",
    description: "The original waffle outsole running shoe, reborn as a lifestyle staple since 1972.",
    price: 9000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "Waffle One",
    description: "Retro waffle outsole meets modern React foam. Heritage look, contemporary comfort.",
    price: 10000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-1",
  },
  {
    name: "Court Vision Low",
    description: "Clean, low-profile court shoe with a leather upper. The everyday sneaker.",
    price: 7500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-2",
  },
  {
    name: "Air Max 90",
    description: "Visible Air cushioning and bold colour blocking. The '90s icon that never faded.",
    price: 14500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-3",
  },
  {
    name: "Court Legacy",
    description: "Canvas upper with a herringbone outsole. Casual simplicity done right.",
    price: 7000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-4",
  },
  {
    name: "Daybreak",
    description: "Retro runner from the '70s vault. Suede overlays and a throwback silhouette.",
    price: 10000,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-5",
  },
  {
    name: "Killshot 2",
    description: "Tennis-inspired leather shoe with a gum rubber outsole. Clean and timeless.",
    price: 8500,
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=100&w=3000&auto=format&fit=crop&ixid=lifestyle-6",
  },

  // ─── BASKETBALL (10) ───────────────────────────────────────────
  {
    name: "LeBron XXI",
    description: "Max Air unit with a cable-lacing system for lockdown during explosive drives.",
    price: 20000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=100&w=3000&auto=format&fit=crop",
  },
  {
    name: "KD 16",
    description: "Low-to-the-ground court feel with full-length Zoom Air. Made for scorers.",
    price: 17500,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=100&w=3000&auto=format&fit=crop&ixid=bball-1",
  },
  {
    name: "Zoom GT Cut 3",
    description: "Cutting-focused design with a React midsole and herringbone traction pattern.",
    price: 19000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=100&w=3000&auto=format&fit=crop&ixid=bball-2",
  },
  {
    name: "Air Jordan XXXVIII",
    description: "The legacy continues. Eclipse plate with Zoom Air cushioning for the modern game.",
    price: 25000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=100&w=3000&auto=format&fit=crop&ixid=bball-3",
  },
  {
    name: "Cosmic Unity 3",
    description: "Sustainable materials meet court performance. At least 20% recycled content by weight.",
    price: 16000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=100&w=3000&auto=format&fit=crop&ixid=bball-4",
  },
  {
    name: "Sabrina 1",
    description: "Designed for the fastest players on the court. Lightweight Cushlon midsole.",
    price: 13000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=100&w=3000&auto=format&fit=crop&ixid=bball-5",
  },
  {
    name: "Giannis Immortality",
    description: "Budget-friendly court shoe with a durable rubber outsole and breathable mesh.",
    price: 10000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=100&w=3000&auto=format&fit=crop&ixid=bball-6",
  },
  {
    name: "G.T. Hustle 2",
    description: "Premium court shoe with a React midsole and midfoot shank for stability.",
    price: 18500,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=100&w=3000&auto=format&fit=crop&ixid=bball-7",
  },
  {
    name: "Book 1",
    description: "Devin Booker's signature shoe. Low-profile with a herringbone outsole.",
    price: 14500,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=100&w=3000&auto=format&fit=crop&ixid=bball-8",
  },
  {
    name: "Zoom Freak 5",
    description: "Reverse Air Zoom strobel for explosive takeoffs and soft landings.",
    price: 14000,
    category: "Basketball",
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=100&w=3000&auto=format&fit=crop&ixid=bball-9",
  },

  // ─── FOOTBALL (10) ─────────────────────────────────────────────
  {
    name: "Mercurial Vapor 15",
    description: "Speed boot with a Vaporposite upper and a tri-star stud pattern for traction.",
    price: 23000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=100&w=3000&auto=format&fit=crop&ixid=fb-1",
  },
  {
    name: "Phantom GX Elite",
    description: "Touch-focused boot with a grippy NikeSkin upper for precise ball control.",
    price: 25000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=100&w=3000&auto=format&fit=crop&ixid=fb-2",
  },
  {
    name: "Tiempo Legend 10",
    description: "Premium kangaroo leather for a glove-like fit and unmatched ball feel.",
    price: 20000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1603787081207-362bcef7c144?q=100&w=3000&auto=format&fit=crop&ixid=fb-3",
  },
  {
    name: "Premier III",
    description: "Classic leather boot with a fold-over tongue. Old-school style, modern soleplate.",
    price: 9500,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?q=100&w=3000&auto=format&fit=crop&ixid=fb-4",
  },
  {
    name: "Streetgato",
    description: "Indoor court football shoe with a gum rubber outsole and suede upper.",
    price: 8000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=100&w=3000&auto=format&fit=crop&ixid=fb-5",
  },
  {
    name: "Lunargato II",
    description: "Futsal specialist with Lunarlon cushioning and a low-profile NikeSkin upper.",
    price: 12000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=100&w=3000&auto=format&fit=crop&ixid=fb-6",
  },
  {
    name: "React Gato",
    description: "React foam meets indoor football. Responsive cushioning for quick turns.",
    price: 11000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=100&w=3000&auto=format&fit=crop&ixid=fb-7",
  },
  {
    name: "Vapor Edge Pro",
    description: "Lightweight speed cleat for firm ground. Aerodynamic collar design.",
    price: 15500,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?q=100&w=3000&auto=format&fit=crop&ixid=fb-8",
  },
  {
    name: "Alpha Menace",
    description: "Aggressive cleat for linemen. Reinforced midfoot cage and deep stud pattern.",
    price: 13500,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop&ixid=fb-9",
  },
  {
    name: "Force Savage Pro",
    description: "Top-tier power cleat with Flyknit construction and a detachable stud system.",
    price: 17000,
    category: "Football",
    imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=100&w=3000&auto=format&fit=crop&ixid=fb-10",
  },
];

async function main() {
  console.log("Seeding database with 50 products...");

  try {
    // Clear existing data for a clean slate
    await db.delete(products);
    console.log("Cleared existing products.");

    await db.insert(products).values(allProducts);
    console.log(`Successfully seeded ${allProducts.length} products!`);

    // Print category breakdown
    const categories = [...new Set(allProducts.map(p => p.category))];
    for (const cat of categories) {
      const count = allProducts.filter(p => p.category === cat).length;
      console.log(`   ${cat}: ${count} products`);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

main();
