"use server";

export async function addToCartAction(productId: number) {
  // Simulate a slow database mutation (800ms)
  // In a real app, you would insert into the Neon DB here
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return { success: true, productId };
}