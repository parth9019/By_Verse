import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiBox, FiShoppingBag, FiDollarSign, FiCheckCircle, FiXCircle, FiCornerUpLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null); // ⭐ NEW
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /* ================= FETCH SELLER PRODUCTS ================= */
  const fetchSellerProducts = async () => {
    try {
      const res = await api.get("/admin/products"); // seller also allowed
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load seller products");
    }
  };

  /* ================= FETCH DASHBOARD SUMMARY ================= */
  const fetchDashboardSummary = async () => {
    try {
      const res = await api.get("/seller/dashboard"); 
      // FIX: The backend returns metrics directly on data, not nested under .summary
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to load dashboard summary");
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchSellerProducts();
      await fetchDashboardSummary();
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const totalProducts = products.length;

  return (
    <div className="max-w-6xl space-y-8">

      {/* PAGE TITLE */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Seller Overview
        </h1>
        <p className="text-xl font-black text-indigo-600 mt-2 uppercase tracking-tight">
          {summary?.shopName || user?.name || "Store"}
        </p>
        <p className="text-lg font-medium text-gray-500 mt-1">
          Monitor your store performance and sales metrics.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Revenue */}
        <StatCard
          title="Net Revenue"
          value={
            loading
              ? "..."
              : `₹${summary?.totalRevenue?.toLocaleString() || 0}`
          }
          icon={<FiDollarSign size={20} />}
          color="indigo"
        />

        {/* Successful Orders */}
        <StatCard
          title="Successful Orders"
          value={loading ? "..." : summary?.successfulOrdersCount || 0}
          icon={<FiCheckCircle size={20} />}
          color="green"
        />

        {/* Cancelled Orders */}
        <StatCard
          title="Cancelled Orders"
          value={loading ? "..." : summary?.cancelledOrdersCount || 0}
          icon={<FiXCircle size={20} />}
          color="red"
        />

        {/* Returned Orders */}
        <StatCard
          title="Returned Orders (Active)"
          value={loading ? "..." : summary?.returnedOrdersCount || 0}
          icon={<FiCornerUpLeft size={20} />}
          color="orange"
        />

        {/* Rejected Returns */}
        <StatCard
          title="Rejected Returns"
          value={loading ? "..." : summary?.rejectedReturnsCount || 0}
          icon={<FiXCircle size={20} />}
          color="red"
        />

        {/* Total Products */}
        <StatCard
          title="Total Products"
          value={loading ? "..." : totalProducts}
          icon={<FiBox size={20} />}
          color="indigo"
        />

        {/* Total Orders */}
        <StatCard
          title="Total Orders (All Time)"
          value={loading ? "..." : summary?.totalOrders || 0}
          icon={<FiShoppingBag size={20} />}
          color="yellow"
        />

        {/* Items Sold */}
        <StatCard
          title="Items Sold"
          value={loading ? "..." : summary?.totalItemsSold || 0}
          icon={<FiShoppingBag size={20} />}
          color="green"
        />

      </div>
    </div>
  );
};

export default SellerDashboard;


/* ================= STAT CARD COMPONENT ================= */

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    green: "bg-green-50 text-green-600 border border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border border-yellow-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    orange: "bg-orange-50 text-orange-600 border border-orange-100",
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-4 rounded-2xl shadow-inner ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <p className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-1">{title}</p>
        <p className="text-4xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">
          {value}
        </p>
      </div>
      {/* Decorative Blob */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gray-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
    </div>
  );
};