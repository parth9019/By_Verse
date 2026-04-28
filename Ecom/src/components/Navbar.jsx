import { useState, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiHeart, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../api/axios";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  /* ================= SAFETY: ADMIN SHOULD NOT SHOW IN USER UI ================= */
  useEffect(() => {
    // If admin accidentally lands on user routes, redirect
    if (user?.role === "admin" && !location.pathname.startsWith("/admin")) {
      navigate("/admin");
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
      {/* ================= TOP BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Universal Back Button */}
          {location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/register" && (
             <button 
               onClick={() => navigate(-1)}
               title="Go Back"
               className="p-1.5 md:p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
             >
                <FiArrowLeft size={18} className="md:w-5 md:h-5"/>
             </button>
          )}

          {/* Logo */}
          <Link
            to={user?.role === "admin" ? "/admin" : "/"}
            onClick={() => setMobileOpen(false)}
            className="text-2xl font-extrabold bg-linear-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            By Verse
          </Link>
        </div>

        {/* Shop Now Link (Desktop) - USER ONLY */}
        {user?.role !== "admin" && (
          <div className="hidden md:flex flex-1 items-center gap-6 mx-8">
            <div className="font-bold text-gray-700 hover:text-primary-600 transition-colors shrink-0">
              Shop Now
            </div>
          </div>
        )}

        {/* Right Section (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm shadow-sm hover:shadow">
                Sign up
              </Link>
            </>
          ) : (
            <>
              {/* 🔥 ROLE-AWARE GREETING */}
              {user.role === "admin" ? (
                <span className="text-sm font-bold tracking-wide text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  Admin Panel
                </span>
              ) : (
                <button
                  onClick={() => navigate("/profile")}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Hi, {user.name}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors hover:underline decoration-red-200 underline-offset-4"
              >
                Logout
              </button>
            </>
          )}

          {/* Wishlist & Cart (USER ONLY) */}
          {user?.role !== "admin" && (
            <div className="flex items-center gap-2 relative">
              <div
                onClick={() => navigate("/wishlist")}
                className="relative cursor-pointer p-2 text-gray-600 hover:text-rose-500 transition-colors bg-gray-50 hover:bg-rose-50 rounded-full"
              >
                <FiHeart size={22} className={wishlistItems.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              <div
                onClick={() => navigate("/cart")}
                className="relative cursor-pointer p-2 text-gray-600 hover:text-primary-600 transition-colors bg-gray-50 hover:bg-primary-50 rounded-full"
              >
                <FiShoppingCart size={22} />
                {totalQty > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {totalQty}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="md:hidden bg-white px-4 pb-4 shadow space-y-4">
          
          {/* Mobile Links - USER ONLY */}
          {user?.role !== "admin" && (
            <div className="flex flex-col gap-4">
              <Link to="/products" onClick={() => setMobileOpen(false)} className="font-bold text-gray-700 bg-gray-50 px-4 py-3 rounded-lg text-center">
                Browse Shop
              </Link>
            </div>
          )}

          {!user ? (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" ? (
                <span className="font-semibold text-indigo-600">
                  Admin Panel
                </span>
              ) : (
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="text-left font-medium"
                >
                  Hi, {user.name}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-left text-red-600"
              >
                Logout
              </button>
            </>
          )}

          {user?.role !== "admin" && (
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  navigate("/wishlist");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700"
              >
                <FiHeart className="text-rose-500" /> Wishlist ({wishlistItems.length})
              </button>
              
              <button
                onClick={() => {
                  navigate("/cart");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700"
              >
                <FiShoppingCart /> Cart ({totalQty})
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
