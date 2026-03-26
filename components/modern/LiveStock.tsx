export default async function LiveStock({ productId }: { productId: number }) {
    // Simulate a slow inventory check to a warehouse API (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Randomly decide if it's in stock for the demo
    const inStock = Math.random() > 0.2;
  
    return (
      <div className="text-sm font-bold">
        {inStock ? 'In Stock' : 'Out of Stock'}
      </div>
    );
  }