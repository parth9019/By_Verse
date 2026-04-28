import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { FiDollarSign, FiLayers, FiList, FiBox, FiUsers, FiTrendingUp, FiTag, FiShoppingBag, FiXCircle, FiCornerUpLeft } from "react-icons/fi";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, colorClass, trend, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col relative overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-purple-300 hover:scale-[1.02]' : 'group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-90 ring-1 ring-inset ring-current/10`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shadow-xs">
            <FiTrendingUp strokeWidth={3} /> {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{value}</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 ${colorClass} rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalCategories: 0, totalSubCategories: 0, totalProducts: 0, totalUsers: 0, adminRevenue: 0 });
  const [analytics, setAnalytics] = useState({ pieData: [], lineData: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/analytics")
        ]);
        setStats(dashRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-wider uppercase text-sm">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Overview</h1>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest">
            Command Center & Analytics
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Platform Revenue" value={`₹${stats.adminRevenue?.toLocaleString() || 0}`} icon={FiDollarSign} colorClass="text-indigo-600 bg-indigo-500" trend="+12%" />
          <StatCard 
            title="Sellers Revenue" 
            value={`₹${stats.sellerRevenue?.toLocaleString() || 0}`} 
            icon={FiDollarSign} 
            colorClass="text-purple-600 bg-purple-500" 
            onClick={() => navigate('/admin/sellers-revenue')}
          />
          <StatCard title="Successful Orders" value={stats.successfulOrdersCount || 0} icon={FiShoppingBag} colorClass="text-emerald-600 bg-emerald-500" />
          <StatCard title="Cancelled Orders" value={stats.cancelledOrdersCount || 0} icon={FiXCircle} colorClass="text-red-600 bg-red-500" />
          <StatCard title="Returned Orders" value={stats.returnedOrdersCount || 0} icon={FiCornerUpLeft} colorClass="text-orange-600 bg-orange-500" />
          <StatCard title="Rejected Returns" value={stats.rejectedReturnsCount || 0} icon={FiXCircle} colorClass="text-rose-600 bg-rose-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={FiUsers} colorClass="text-purple-600 bg-purple-500" />
          <StatCard title="Total Products" value={stats.totalProducts} icon={FiBox} colorClass="text-amber-600 bg-amber-500" />
          <StatCard title="Active Categories" value={stats.totalCategories} icon={FiLayers} colorClass="text-blue-600 bg-blue-500" />
          <StatCard title="Active Coupons" value={stats.totalCoupons || 0} icon={FiTag} colorClass="text-pink-600 bg-pink-500" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-gray-900 tracking-tight">Revenue Trends</h2>
             <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-200">Last 6 Months</span>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.lineData.map(d => ({ ...d, Platform: Number(d.Platform) || 0, Sellers: Number(d.Sellers) || 0 }))} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 13, fontWeight: 700}} dy={10} />
                <YAxis type="number" domain={[0, 'auto']} allowDataOverflow={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 13, fontWeight: 700}} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                  itemStyle={{ fontWeight: '900', color: '#111827' }}
                  labelStyle={{ fontWeight: '700', color: '#6b7280', marginBottom: '4px' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 700, paddingBottom: '10px' }}/>
                <Line type="monotone" dataKey="Platform" name="Admin (Platform)" stroke="#4f46e5" strokeWidth={5} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#4f46e5' }} animationDuration={1500} />
                <Line type="monotone" dataKey="Sellers" name="Third-Party Sellers" stroke="#9333ea" strokeWidth={5} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#9333ea' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#9333ea' }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 md:p-8 flex flex-col">
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Order Status Mix</h2>
          
          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center relative">
            {analytics.pieData?.length > 0 && analytics.pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {analytics.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Legend 
                    iconType="circle" 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    wrapperStyle={{ fontSize: '12px', fontWeight: 800, paddingTop: '20px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <FiBox className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-bold text-sm uppercase tracking-wider">No Orders Yet</p>
              </div>
            )}
            
            {/* Center Label for Pie */}
            {analytics.pieData?.length > 0 && analytics.pieData.some(d => d.value > 0) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <span className="text-3xl font-black text-gray-900 tracking-tighter">
                  {analytics.pieData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
