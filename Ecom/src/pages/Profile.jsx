import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiLock,
  FiHelpCircle,
  FiFileText,
  FiLogOut,
  FiCamera,
  FiHome,
} from "react-icons/fi";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-10 relative">
      {/* Decorative main bg blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

        {/* ===== PROFILE HEADER ===== */}
        <ProfileHeader user={user} />

        {/* ===== DASHBOARD ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <div className="lg:col-span-1 border-none shadow-xl shadow-indigo-100/20 bg-white/80 backdrop-blur-md rounded-3xl p-5">
             <ProfileSidebar role={user?.role} onLogout={handleLogout} />
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-indigo-100/20 border border-white/50 p-6 md:p-8 min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

/* ================= SUB COMPONENTS ================= */

const ProfileHeader = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl shadow-2xl overflow-hidden relative group">
      {/* Dynamic Vibrant Gradient Background matching Hero Section */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-900 via-indigo-900 to-primary-800 z-0 transition-transform duration-700 group-hover:scale-105"></div>
      
      {/* Abstract Glowing Decorators */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[400px] bg-primary-500/30 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 w-[300px] h-[300px] bg-indigo-500/40 rounded-full blur-3xl z-0" />

      {/* Content wrapper with glassmorphism over the gradient */}
      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8 bg-black/10 backdrop-blur-[2px] border border-white/10">
        
        {/* LEFT: USER INFO */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
          <div className="relative cursor-pointer group/avatar">
            {/* Dynamic generated premium UI avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white shadow-indigo-500/50 transform transition-transform duration-500 group-hover/avatar:scale-110">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&size=200&bold=true&rounded=false`} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-3 -right-3 bg-white p-3 rounded-full shadow-xl text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-300 transform hover:scale-110 border border-gray-100">
              <FiCamera size={20} />
            </button>
          </div>

          <div className="mb-2">
             <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
              {user?.role || "User"}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2">
              {user?.name || "Welcome Back"}
            </h1>
            <p className="text-primary-100 font-medium text-lg drop-shadow-md flex items-center gap-2 justify-center md:justify-start">
               <FiUser className="opacity-80"/> {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        {/* RIGHT: HOME BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="flex justify-center items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-bold hover:bg-white hover:text-indigo-900 border border-white/20 transition-all duration-300 shadow-xl"
        >
          <FiHome size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
};

const ProfileSidebar = ({ role, onLogout }) => {
  const menu = [
    { to: "/profile", label: "Profile Information", icon: <FiUser size={20} />, end: true },
    { to: "/profile/orders", label: "My Orders", icon: <FiPackage size={20} /> },
    { to: "/profile/addresses", label: "Saved Addresses", icon: <FiMapPin size={20} /> },
    { to: "/profile/security", label: "Login & Security", icon: <FiLock size={20} /> },
    { to: "/profile/terms", label: "Terms & Policies", icon: <FiFileText size={20} /> },
    { to: "/profile/help", label: "Help & Support", icon: <FiHelpCircle size={20} /> },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest px-4 mb-4 mt-2">Dashboard Navigation</h3>
      {menu.map((item) => (
        <SidebarLink key={item.label} {...item} />
      ))}

      {role === "user" && (
        <div className="pt-6 mt-6 border-t border-gray-100 px-2 relative group">
            <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-r from-primary-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            <NavLink
            to="/profile/become-seller"
            className={({ isActive }) =>
                `block text-center text-sm font-extrabold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm border border-transparent ${isActive ? 'bg-primary-600 text-white shadow-primary-500/30' : 'text-primary-600 bg-primary-50 hover:bg-primary-600 hover:text-white hover:shadow-primary-500/30'}`
            }
            >
            Become a Seller
            </NavLink>
        </div>
      )}

      <div className="pt-4 mt-2 px-2">
          <button
            onClick={onLogout}
            className="w-full flex justify-center items-center gap-2 px-4 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100 hover:border-transparent group shadow-sm hover:shadow-red-500/30"
          >
            <FiLogOut size={18} className="transition-transform group-hover:-translate-x-1" /> Logout
          </button>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
      ${
        isActive
          ? "text-indigo-700 bg-indigo-50/80 shadow-inner"
          : "hover:bg-gray-50 text-gray-600 hover:text-indigo-600 hover:translate-x-1"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full"></div>}
        <span className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white text-indigo-600 shadow-xs' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
          {icon}
        </span> 
        {label}
      </>
    )}
  </NavLink>
);
