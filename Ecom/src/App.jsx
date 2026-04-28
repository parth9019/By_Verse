import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Otp from "./pages/Otp";
import SellerStore from "./pages/SellerStore";

/* ================= SHOP / USER PAGES ================= */
import ShopProducts from "./pages/shop/Products";
import Cart from "./pages/shop/Cart";
import ProductDetails from "./pages/shop/ProductDetails";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Payment from "./pages/Payment"; // ⭐ NEW
import Wishlist from "./pages/shop/Wishlist";

/* ================= PROFILE PAGES ================= */
import Profile from "./pages/Profile";
import ProfileInfo from "./pages/profile/ProfileInfo";
import Addresses from "./pages/profile/Addresses";
import ChangePassword from "./pages/profile/ChangePassword";
import BecomeSeller from "./pages/profile/BecomeSeller";
import Terms from "./pages/profile/Terms";
import Help from "./pages/profile/Help";

/* ================= SELLER PAGES ================= */
import SellerRoute from "./routes/SellerRoute";
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";

/* ================= PROTECTED ROUTES ================= */
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

/* ================= ADMIN PAGES ================= */
import AdmnLayout from "./pages/admin/AdmnLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import Categories from "./pages/admin/Categories";
import SubCategories from "./pages/admin/SubCategories"; // ✅ NEW
import Coupons from "./pages/admin/Coupons"; // ✅ NEW
import Products from "./pages/admin/Products";
import AdminOrders from "./pages/admin/AdminOrders";
import SellerRequests from "./pages/admin/SellerRequests";
import ManageSellers from "./pages/admin/ManageSellers";
import AuditDetails from "./pages/admin/AuditDetails"; // ✅ NEW
import SellersRevenue from "./pages/admin/SellersRevenue"; // 🚀 NEW
import StockLogs from "./pages/admin/StockLogs"; // 📦 NEW
import AdminReports from "./pages/admin/AdminReports"; // 📊 NEW

/* ================= AUTH CONTEXT ================= */
import { useAuth } from "./context/AuthContext";

/* ================= ROUTES ================= */
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">
          Loading application...
        </span>
      </div>
    );
  }

  return (
    <Routes>

      {/* ================= DEFAULT HOME ================= */}
      <Route
        path="/"
        element={
          user?.role === "admin" ? (
            <Navigate to="/admin" />
          ) : user?.role === "seller" ? (
            <Navigate to="/seller" />
          ) : (
            <Home />
          )
        }
      />

      {/* ================= AUTH PAGES ================= */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* OTP DISABLED */}
      {/* 
      <Route path="/otp" element={<Otp />} />
      */}

      {/* ================= PRODUCT ================= */}
      <Route path="/products" element={<ShopProducts />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/seller/:id" element={<SellerStore />} />

      {/* ⭐ PAYMENT PAGE */}
      <Route
        path="/payment/:orderId"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />

      {/* ================= USER PROTECTED ================= */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      {/* ================= WISHLIST ================= */}
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      {/* ================= PROFILE ================= */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfileInfo />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="security" element={<ChangePassword />} />
        <Route path="terms" element={<Terms />} />
        <Route path="help" element={<Help />} />
        <Route path="become-seller" element={<BecomeSeller />} />
      </Route>

      {/* ================= MY ORDERS DIRECT ================= */}
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdmnLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="categories" element={<Categories />} />
        <Route path="subcategories" element={<SubCategories />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="seller-requests" element={<SellerRequests />} />
        <Route path="manage-sellers" element={<ManageSellers />} />
        <Route path="sellers-revenue" element={<SellersRevenue />} />
        <Route path="audits" element={<AuditDetails />} />
        <Route path="stock-logs" element={<StockLogs />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* ================= SELLER ================= */}
      <Route
        path="/seller"
        element={
          <SellerRoute>
            <SellerLayout />
          </SellerRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center text-gray-500">
            Page not found
          </div>
        }
      />

    </Routes>
  );
}

/* ================= ROOT ================= */
import { useLocation } from "react-router-dom";
import Footer from "./components/Footer";

function ConditionalFooter() {
  const location = useLocation();
  // Ensure the footer does not visually clash with dashboard layouts
  const hideFooter = location.pathname.startsWith("/admin") || location.pathname.startsWith("/seller");
  
  if (hideFooter) return null;
  return <Footer />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <AppRoutes />
        </div>
        <ConditionalFooter />
      </div>
    </BrowserRouter>
  );
}