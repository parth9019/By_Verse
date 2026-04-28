import { NavLink, Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiBox,
  FiList,
  FiShoppingBag,
  FiLogOut,
  FiUserCheck,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiTag,
  FiLayers,
  FiDownload,
  FiMenu,
  FiX,
  FiArrowLeft
} from "react-icons/fi";

const AdmnLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= HARD ROLE PROTECTION ================= */
  useEffect(() => {
    // If user is logged out or not admin → kick out
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // While auth is restoring
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="font-medium">Loading admin panel...</p>
      </div>
    );
  }

  // Extra safety (render-level)
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
     ${
       isActive
         ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
     }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      
      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          {location.pathname !== "/admin" && (
             <button 
               onClick={() => navigate(-1)}
               title="Go Back"
               className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
             >
                <FiArrowLeft size={18} />
             </button>
          )}
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-600">
            By Verse Admin
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
        className={`w-64 bg-white border-r border-gray-100 shadow-sm fixed inset-y-0 left-0 z-40 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-600 border-b border-gray-100">
          By Verse Admin
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <NavLink to="/admin" end className={linkClass}>
            <FiGrid size={20} /> Dashboard
          </NavLink>

          <NavLink to="/admin/categories" className={linkClass}>
            <FiList size={20} /> Categories
          </NavLink>

          <NavLink to="/admin/subcategories" className={linkClass}>
            <FiList size={20} /> Sub Categories
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            <FiBox size={20} /> Products
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            <FiShoppingBag size={20} /> Orders
          </NavLink>

          <NavLink to="/admin/coupons" className={linkClass}>
            <FiTag size={20} /> Deals & Coupons
          </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              <FiTrendingUp size={20} />
              Analytics
            </NavLink>

        <NavLink
          to="/admin/seller-requests"
          className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
          ${
          isActive
            ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FiUserCheck size={20} />
          Seller Requests
        </NavLink>

        <NavLink
          to="/admin/manage-sellers"
          className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
          ${
          isActive
            ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FiUsers size={20} />
          Manage Sellers
        </NavLink>

        <NavLink
          to="/admin/audits"
          className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
          ${
          isActive
            ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FiActivity size={20} />
          Activity Logs
        </NavLink>

        <NavLink
           to="/admin/stock-logs"
           className={({ isActive }) =>
           `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
           ${
           isActive
             ? "bg-linear-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20"
             : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
             }`
           }
        >
           <FiLayers size={20} />
           Stock Logs
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
          ${
          isActive
            ? "bg-linear-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
            : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`
          }
        >
          <FiDownload size={20} />
          Reports
        </NavLink>
        </nav>

        {/* Admin Info */}
        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Logged in as
          </p>
          <p className="font-bold text-base mb-4 text-gray-900 truncate">
            {user.name} <span className="text-primary-600 text-xs tracking-normal bg-primary-50 px-2 py-0.5 rounded ml-1">Admin</span>
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-600 py-3 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm font-bold"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 md:ml-64 relative min-h-screen overflow-x-hidden flex flex-col">
        {/* Subtle decorative background for main area */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 md:w-96 md:h-96 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center px-8 lg:px-10 py-5 z-10 sticky top-0">
           {location.pathname !== "/admin" && (
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all font-bold text-sm shadow-sm active:scale-95"
              >
                 <FiArrowLeft size={18} />
                 Back
              </button>
           )}
        </div>

        <div className="p-4 sm:p-8 lg:p-10 w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdmnLayout;
