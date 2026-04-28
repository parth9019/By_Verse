import { useEffect, useState } from "react";
import api from "../../api/axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FiTrendingUp, FiPieChart } from "react-icons/fi";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Shipped: "#6366f1",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-4 rounded-xl shadow-xl">
        <p className="font-black text-gray-900 mb-1">{label}</p>
        <p className="font-bold text-indigo-600">
          Revenue: ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SellerAnalytics = () => {
  const [data, setData] = useState({ pieData: [], lineData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/seller/analytics");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load seller analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 font-medium">
        Loading analytics engine...
      </div>
    );
  }

  const activePieData = data.pieData.filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <FiTrendingUp className="text-indigo-600" /> Storefront Analytics
        </h1>
        <p className="text-lg font-medium text-gray-500 mt-2">
          Track your personal product sales performance and order completion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative group">
          <div className="absolute -inset-4 bg-linear-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-xl"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            6-Month Direct Revenue
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative group">
          <div className="absolute -inset-4 bg-linear-to-br from-emerald-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-xl"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiPieChart className="text-emerald-500" /> Order Fulfillment
          </h2>
          
          {activePieData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">No order data available</div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activePieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {activePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1f2937', fontWeight: '900' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '700', color: '#6b7280' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SellerAnalytics;
