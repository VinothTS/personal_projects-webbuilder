'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Cart } from '@/types/cart';

interface CartContextType {
  items: CartItem[];
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, packaging: string) => void;
  updateQuantity: (productId: string, packaging: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === newItem.productId && item.packaging === newItem.packaging
      );

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.productId === newItem.productId && item.packaging === newItem.packaging
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string, packaging: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.productId === productId && item.packaging === packaging))
    );
  };

  const updateQuantity = (productId: string, packaging: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, packaging);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.packaging === packaging
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + ((item.priceAmount ?? 0) * item.quantity);
    }, 0);
  };

  const cart: Cart = {
    items,
    total: calculateTotal(),
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
