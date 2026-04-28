import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // 🔑 User-specific cart key
  const cartKey = user ? `cart_${user.id}` : null;

  // 🔁 Load cart on login / user change
  useEffect(() => {
    if (cartKey) {
      const stored = localStorage.getItem(cartKey);
      setCartItems(stored ? JSON.parse(stored) : []);
    } else {
      setCartItems([]);
    }
  }, [cartKey]);

  // 💾 Persist cart
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, cartKey]);

  /**
   * ➕ ADD TO CART
   * RULE: product can be added ONLY ONCE
   */
  const addToCart = (product, qty) => {
    setCartItems((prev) => {
      const exists = prev.find((p) => p._id === product._id);

      // 🔄 If already in cart, explicitly sync the new requested quantity
      if (exists) {
        return prev.map((p) =>
          p._id === product._id
            ? { ...p, qty: Math.min(qty, p.stock) }
            : p
        );
      }

      // ✅ Add once
      return [
        ...prev,
        {
          ...product,
          qty: Math.min(qty, product.stock),
        },
      ];
    });
  };

  /**
   * 🔄 UPDATE QUANTITY (ONLY FROM CART PAGE)
   */
  const updateQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              qty: Math.max(1, Math.min(qty, p.stock)),
            }
          : p
      )
    );
  };

  /**
   * ➖ REMOVE ITEM
   */
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((p) => p._id !== id));
  };

  /**
   * 🧹 CLEAR CART
   */
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
