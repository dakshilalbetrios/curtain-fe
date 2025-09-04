import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (collection_sr_no_id: number) => void;
  updateQuantity: (collection_sr_no_id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.collection_sr_no_id === item.collection_sr_no_id);
      if (existingItem) {
        return prev.map(i =>
          i.collection_sr_no_id === item.collection_sr_no_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (collection_sr_no_id: number) => {
    setCartItems(prev => prev.filter(i => i.collection_sr_no_id !== collection_sr_no_id));
  };

  const updateQuantity = (collection_sr_no_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(collection_sr_no_id);
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.collection_sr_no_id === collection_sr_no_id
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};