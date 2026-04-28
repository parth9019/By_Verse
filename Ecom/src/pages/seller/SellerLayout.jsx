import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FiGrid,
  FiBox,
  FiLogOut,
  FiHome,
  FiUser,
  FiShoppingCart,
  FiTrendingUp,
  FiMenu,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const SellerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
     ${
       isActive
         ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
     }`;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          {location.pathname !== "/seller" && (
             <button 
               onClick={() => navigate(-1)}
               title="Go Back"
               className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
             >
                <FiArrowLeft size={18} />
             </button>
          )}
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-600">
            By Verse Seller
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2 focus:outline-none">
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ================= OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`w-64 bg-white border-r border-gray-100 shadow-sm fixed inset-y-0 left-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Brand */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 bg-linear-to-r from-primary-600 to-indigo-600 text-white font-extrabold tracking-wide text-xl shadow-inner">
          By Verse Seller
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">

          <NavLink to="/seller" end className={linkClass}>
            <FiGrid size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/seller/analytics"
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <FiTrendingUp size={18} />
            Analytics
          </NavLink>

          <NavLink to="/seller/products" className={linkClass}>
            <FiBox size={18} />
            My Products
          </NavLink>

          <NavLink to="/seller/orders" className={linkClass}>
            <FiShoppingCart size={18} />
            My Orders
          </NavLink>

          <NavLink to="/" className={linkClass}>
            <FiHome size={18} />
            View Store
          </NavLink>

        </nav>

        {/* Seller Info */}
        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-extrabold text-xl shadow-sm border border-primary-200">
              {user?.name?.charAt(0)}
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs font-semibold text-primary-600 mt-0.5">
                Seller Account
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-600 py-3 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm font-bold"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 md:ml-64 flex flex-col relative min-h-screen overflow-x-hidden w-full">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 md:w-96 md:h-96 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 lg:px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-4">
            {location.pathname !== "/seller" && (
              <button 
                onClick={() => navigate(-1)}
                title="Go Back"
                className="p-1.5 md:p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95 hidden md:block"
              >
                 <FiArrowLeft size={18} className="md:w-5 md:h-5"/>
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Seller Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50/80 border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
            <FiUser size={18} className="text-primary-600" />
            <span>{user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 w-full overflow-x-hidden">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default SellerLayout;
