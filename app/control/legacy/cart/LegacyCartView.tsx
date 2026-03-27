"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getLocalStorageCart,
  updateLocalStorageQuantity,
  removeFromLocalStorageCart,
  type CartItem,
} from "@/lib/cart";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface CartProduct extends CartItem {
  product: Product | null;
}

// ──────────────────────────────────────────────────────────────────
// ANTI-PATTERN: CSS-IN-JS (styled-components)
// Runtime <style> injection on every render adds to TBT.
// ──────────────────────────────────────────────────────────────────
const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 60vh;
`;

const CartHeader = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin-bottom: 2rem;
`;

const CartItemRow = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e5e5e5;
  align-items: center;
`;

const ItemImage = styled.div`
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f5f5f5;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ItemName = styled.h3`
  font-weight: 700;
  font-size: 1rem;
`;

const ItemPrice = styled.p`
  font-weight: 700;
  font-size: 1rem;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const QuantityButton = styled.button<{ $disabled?: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 2px solid ${(props) => (props.$disabled ? "#d4d4d4" : "#000")};
  background: ${(props) => (props.$disabled ? "#f5f5f5" : "white")};
  color: ${(props) => (props.$disabled ? "#a3a3a3" : "#000")};
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background: black;
    color: white;
  }
`;

const RemoveButton = styled.button`
  color: #a3a3a3;
  font-size: 0.75rem;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  &:hover {
    color: #ef4444;
  }
`;

const OrderSummary = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: #fafafa;
  border-radius: 1rem;
  border: 1px solid #e5e5e5;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #525252;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0 0;
  margin-top: 0.5rem;
  border-top: 2px solid black;
  font-size: 1.25rem;
  font-weight: 900;
`;

const CheckoutButton = styled.button<{ $processing?: boolean }>`
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${(props) => (props.$processing ? "not-allowed" : "pointer")};
  background: ${(props) => (props.$processing ? "#a3a3a3" : "black")};
  color: white;
  transition: background 0.2s;
  &:hover:not(:disabled) {
    background: #262626;
  }
`;

export default function LegacyCartView() {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // ──────────────────────────────────────────────────────────────
  // ANTI-PATTERN 1: SEQUENTIAL FETCH WATERFALL
  // Each cart item is fetched INDIVIDUALLY in sequence. If the user
  // has 5 items, that's 5 × 300ms = 1.5s of waterfalled requests.
  // The experimental group does a single batched DB query.
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadCart = async () => {
      const items = getLocalStorageCart();
      const loaded: CartProduct[] = [];

      // Sequential waterfall — fetch one at a time
      for (const item of items) {
        try {
          const res = await fetch(`/api/products/${item.productId}`);
          const product = await res.json();
          loaded.push({ ...item, product });
        } catch {
          loaded.push({ ...item, product: null });
        }
      }

      setCartProducts(loaded);
      setLoading(false);
    };
    loadCart();
  }, []);

  // ──────────────────────────────────────────────────────────────
  // ANTI-PATTERN 2: PESSIMISTIC QUANTITY UPDATE
  // The UI is disabled while the update processes. Full component
  // re-render + localStorage write + state update blocks the thread.
  // ──────────────────────────────────────────────────────────────
  const handleQuantityChange = async (productId: number, delta: number) => {
    setUpdating(productId);
    // Simulate server round-trip for quantity update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newCart = updateLocalStorageQuantity(productId, delta);
    // Re-fetch products for updated cart (triggers full re-render)
    const updated: CartProduct[] = [];
    for (const item of newCart) {
      const existing = cartProducts.find((cp) => cp.productId === item.productId);
      if (existing) {
        updated.push({ ...item, product: existing.product });
      }
    }
    setCartProducts(updated);
    setUpdating(null);
  };

  const handleRemove = async (productId: number) => {
    setUpdating(productId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeFromLocalStorageCart(productId);
    setCartProducts((prev) => prev.filter((item) => item.productId !== productId));
    setUpdating(null);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    // Simulate a very slow checkout process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.removeItem("bolt-cart");
    alert("Order placed! Thank you for your purchase.");
    setCartProducts([]);
    setCheckingOut(false);
  };

  const subtotal = cartProducts.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 499;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-neutral-500">Loading Cart...</p>
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <CartContainer>
        <CartHeader>Your Cart</CartHeader>
        <div className="text-center py-20">
          <p className="text-xl text-neutral-500 mb-6">Your cart is empty</p>
          <a
            href="/control/legacy"
            className="inline-block bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-neutral-800 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <CartHeader>Your Cart ({cartProducts.length})</CartHeader>

      {/* ─── CART ITEMS ─────────────────────────────────────────── */}
      {cartProducts.map((item) => {
        if (!item.product) return null;
        const isUpdating = updating === item.productId;

        return (
          <CartItemRow
            key={item.productId}
            style={{ opacity: isUpdating ? 0.5 : 1 }}
          >
            {/* ANTI-PATTERN: Unoptimised <img> thumbnails */}
            <ItemImage>
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-full h-full object-cover"
                // NO width, height, loading, srcset
              />
            </ItemImage>

            <ItemDetails>
              <ItemName>{item.product.name}</ItemName>
              <p className="text-sm text-neutral-500">{item.product.category}</p>
              <ItemPrice>£{(item.product.price / 100).toFixed(2)}</ItemPrice>

              <QuantityControl>
                <QuantityButton
                  $disabled={isUpdating}
                  disabled={isUpdating}
                  onClick={() => handleQuantityChange(item.productId, -1)}
                >
                  −
                </QuantityButton>
                <span className="font-bold text-sm w-6 text-center">
                  {item.quantity}
                </span>
                <QuantityButton
                  $disabled={isUpdating}
                  disabled={isUpdating}
                  onClick={() => handleQuantityChange(item.productId, 1)}
                >
                  +
                </QuantityButton>
              </QuantityControl>

              <RemoveButton
                disabled={isUpdating}
                onClick={() => handleRemove(item.productId)}
              >
                Remove
              </RemoveButton>
            </ItemDetails>

            <p className="font-bold text-lg">
              £{((item.product.price * item.quantity) / 100).toFixed(2)}
            </p>
          </CartItemRow>
        );
      })}

      {/* ─── ORDER SUMMARY ──────────────────────────────────────── */}
      <OrderSummary>
        <SummaryRow>
          <span>Subtotal</span>
          <span>£{(subtotal / 100).toFixed(2)}</span>
        </SummaryRow>
        <SummaryRow>
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `£${(shipping / 100).toFixed(2)}`}</span>
        </SummaryRow>
        <TotalRow>
          <span>Total</span>
          <span>£{(total / 100).toFixed(2)}</span>
        </TotalRow>
        <CheckoutButton
          $processing={checkingOut}
          disabled={checkingOut}
          onClick={handleCheckout}
        >
          {checkingOut ? "Processing..." : "Checkout"}
        </CheckoutButton>
      </OrderSummary>
    </CartContainer>
  );
}
