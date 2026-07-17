import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '../types';

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = 'nafi-marketplace-cart';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value ? (JSON.parse(value) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      addItem: (product) => {
        setItems((current) => {
          const existing = current.find(
            (item) => item.product.id === product.id,
          );
          if (existing) {
            return current.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      removeItem: (productId) => {
        setItems((current) =>
          current.filter((item) => item.product.id !== productId),
        );
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          setItems((current) =>
            current.filter((item) => item.product.id !== productId),
          );
          return;
        }
        setItems((current) =>
          current.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        );
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart harus dipakai di dalam CartProvider.');
  return value;
}
