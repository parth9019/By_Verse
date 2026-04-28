import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiArrowLeft, FiDollarSign, FiUsers, FiBox } from "react-icons/fi";
import { Link } from "react-router-dom";

const SellersRevenue = () => {
   const [sellers, setSellers] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchSellers = async () => {
       try {
         const res = await api.get("/admin/sellers-revenue");
         setSellers(res.data);
       } catch (error) {
         console.error("Failed to load seller revenue data", error);
       } finally {
         setLoading(false);
       }
     };
     fetchSellers();
   }, []);

   if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
         <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="font-bold tracking-wider uppercase text-sm">Loading Analytics...</p>
       </div>
     );
   }

   const grossSellerRevenue = sellers.reduce((acc, curr) => acc + curr.revenue, 0);

   return (
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
           <Link to="/admin" className="p-2 bg-gray-50 text-gray-500 rounded-xl border border-gray-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all shadow-sm">
             <FiArrowLeft size={20}/>
           </Link>
           <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sellers Revenue Breakdown</h1>
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Audit Third-Party Financial Flow</p>
           </div>
        </div>

        {/* Global Summary */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20">
           <div className="flex items-center gap-6">
             <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
               <FiDollarSign className="w-8 h-8 text-indigo-100" />
             </div>
             <div>
               <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Gross Network Revenue</p>
               <h2 className="text-4xl font-black tracking-tight">₹{grossSellerRevenue.toLocaleString()}</h2>
             </div>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-indigo-700/50 px-6 py-4 rounded-2xl border border-indigo-500/30 text-center">
                 <p className="text-2xl font-black">{sellers.length}</p>
                 <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">Active Partners</p>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-left border-collapse min-w-max">
              <thead>
                 <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 md:px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Seller Identity</th>
                    <th className="px-6 md:px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Items Sold</th>
                    <th className="px-6 md:px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Net Revenue</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {sellers.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-6 md:px-8 py-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg shadow-sm border border-purple-200">
                            {s.seller?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">{s.seller?.name || "Unknown Seller"}</p>
                            <p className="text-xs font-medium text-gray-500">{s.seller?.email || "No Email"}</p>
                          </div>
                       </td>
                       <td className="px-6 md:px-8 py-6 text-right font-bold text-gray-600 text-sm">
                          {s.itemsSold}
                       </td>
                       <td className="px-6 md:px-8 py-6 text-right">
                          <p className="font-extrabold text-primary-600 text-lg">₹{s.revenue.toLocaleString()}</p>
                       </td>
                    </tr>
                 ))}
                 {sellers.length === 0 && (
                     <tr>
                       <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                          <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                          <p className="font-bold uppercase tracking-widest text-sm">No Third-Party Seller Revenue Detected</p>
                       </td>
                     </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
   );
};

export default SellersRevenue;
