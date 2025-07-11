import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Menu, Extra } from '@shared/schema';

export interface CartItem {
  id: number;
  menuItem: Menu;
  quantity: number;
  extras: Extra[];
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  totalItems: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { menuItem: Menu; quantity: number; extras: Extra[] } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  totalItems: 0,
};

function calculateItemTotal(menuItem: Menu, quantity: number, extras: Extra[]): number {
  const basePrice = parseFloat(menuItem.price);
  const extrasTotal = extras.reduce((sum, extra) => sum + parseFloat(extra.price), 0);
  return (basePrice + extrasTotal) * quantity;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity, extras } = action.payload;
      const totalPrice = calculateItemTotal(menuItem, quantity, extras);
      
      // Check if item with same menu item and extras already exists
      const existingItemIndex = state.items.findIndex(item => 
        item.menuItem.id === menuItem.id && 
        item.extras.length === extras.length &&
        item.extras.every(extra => extras.some(e => e.id === extra.id))
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...state.items];
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
          totalPrice: calculateItemTotal(menuItem, existingItem.quantity + quantity, extras),
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now(), // Simple ID generation
          menuItem,
          quantity,
          extras,
          totalPrice,
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        totalItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }

      const newItems = state.items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              quantity,
              totalPrice: calculateItemTotal(item.menuItem, quantity, item.extras),
            }
          : item
      );

      const total = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        totalItems,
      };
    }

    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      const newItems = state.items.filter(item => item.id !== id);
      const total = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        totalItems,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (menuItem: Menu, quantity: number, extras: Extra[]) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (menuItem: Menu, quantity: number, extras: Extra[]) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity, extras } });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
