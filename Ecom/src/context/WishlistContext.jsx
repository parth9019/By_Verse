import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    if (!user || user.role === "admin") {
      setWishlistItems([]);
      return;
    }
    try {
      const res = await api.get("/user/wishlist");
      setWishlistItems(res.data);
    } catch (error) {
      console.error("Failed to fetch wishlist");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      alert("Please log in to manage your wishlist");
      return;
    }
    try {
      const res = await api.post(`/user/wishlist/${productId}`);
      await fetchWishlist(); // Refresh the list
      return res.data.added; // Returns boolean indicating if added or removed
    } catch (error) {
      console.error("Failed to toggle wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, toggleWishlist, isInWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
