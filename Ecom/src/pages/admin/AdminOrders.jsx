/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiBox, FiCalendar, FiUser, FiCreditCard, FiTag, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiCornerUpLeft, FiAlertCircle, FiShoppingBag } from "react-icons/fi";

const statusConfig = {
  Pending: { color: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100", icon: FiClock },
  Processing: { color: "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100", icon: FiBox },
  Shipped: { color: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100", icon: FiTruck },
  Delivered: { color: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100", icon: FiCheckCircle },
  Cancelled: { color: "bg-red-50 text-red-700 border-red-200 shadow-red-100", icon: FiXCircle },
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  const approveReturn = async (orderId) => {
    if (!window.confirm("Approve this return request?")) return;
    try {
      await api.put(`/admin/orders/${orderId}/return-approve`);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve return");
    }
  };

  const rejectReturn = async (orderId) => {
    if (!window.confirm("Reject this return request?")) return;
    try {
      await api.put(`/admin/orders/${orderId}/return-reject`);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject return");
    }
  };

  const executeRefund = async (orderId) => {
    if (!window.confirm("Process final refund? (This will automatically refund Stripe payments if applicable)")) return;
    try {
      await api.put(`/admin/orders/${orderId}/return-refund`);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process refund");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-wider uppercase text-sm text-indigo-900/40">Synchronizing Orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <FiBox className="text-indigo-600" /> Administrative Orders
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            Monitor, Audit, & Dispatch Financial Workflows
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-2xl shadow-inner">
           <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md">
             {orders.length}
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Volume</p>
             <p className="text-sm font-bold text-indigo-900">Active Transactions</p>
           </div>
        </div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* Orders Feed */}
      <div className="space-y-8">
        {orders.map((order) => {
          const isAdminOnly = order.items.every(item => item.product && !item.product.seller);
          const isSellerOnly = order.items.every(item => item.product && item.product.seller);
          
          let sellerName = "Third-Party";
          if (isSellerOnly && order.items.length > 0) {
             const s = order.items[0].product?.seller;
             if (s) sellerName = s.shopName || s.name || "Third-Party";
          }
          
          const orderType = isAdminOnly ? "Platform Order" : isSellerOnly ? `${sellerName} Order` : "Mixed Order";
          const orderTypeColor = isAdminOnly ? "bg-indigo-600 text-white shadow-indigo-200" : isSellerOnly ? "bg-purple-600 text-white shadow-purple-200" : "bg-blue-600 text-white shadow-blue-200";
          const StatusIcon = statusConfig[order.status]?.icon || FiBox;
          const statusClass = statusConfig[order.status]?.color || "bg-gray-100 text-gray-700";

          return (
            <div
              key={order._id}
              className="bg-white rounded-4xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-500 group"
            >
              {/* ORDER HEADER */}
              <div className="bg-gray-50/50 px-6 md:px-10 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                        <FiTag className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Order Authority</p>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-md shadow-sm border ${orderTypeColor}`}>
                            {orderType}
                          </span>
                       </div>
                     </div>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                        <FiCalendar className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Purchased On</p>
                       <p className="font-bold text-gray-900 text-sm">
                         {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </p>
                     </div>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-sm ${statusClass}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-black tracking-wider uppercase">{order.status}</span>
                </div>

              </div>

              {/* ORDER DETAILS GRID */}
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                
                {/* Order Items (Left Column) */}
                <div className="lg:col-span-5 flex flex-col">
                  <h3 className="text-gray-900 font-black tracking-tight text-base mb-6 flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FiShoppingBag className="w-4 h-4" /></div>
                     Purchased Inventory
                  </h3>
                  
                  <div className="space-y-4 flex-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all group/item">
                        <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-20 w-20 flex shrink-0 items-center justify-center overflow-hidden group-hover/item:border-indigo-200 transition-colors">
                          <img
                            src={getImageUrl(item.image || item.product?.image || item.product?.images?.[0])}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-contain mix-blend-multiply transform group-hover/item:scale-110 transition-transform duration-500"
                          />
                          {!(item.image || item.product?.image || item.product?.images?.[0]) && (
                            <div className="absolute inset-0 bg-gray-50/90 backdrop-blur-sm flex items-center justify-center text-gray-400">
                               <FiXCircle className="w-5 h-5"/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                             <p className="font-bold text-gray-900 group-hover/item:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                               {item.product ? item.product.name : "Unregistered Product"}
                             </p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                             {item.product && (
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border ${!item.product.seller ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                   {!item.product.seller ? 'Admin' : `Seller: ${item.product.seller.shopName || item.product.seller.name || 'Third-Party'}`}
                                </span>
                             )}
                             <p className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 border border-gray-100 rounded-md shadow-sm">
                               Qty {item.qty} × ₹{item.price.toLocaleString()}
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column (Information & Actions) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Customer Card */}
                  <div className="bg-gray-50/50 rounded-4xl p-6 md:p-8 border border-gray-100 relative overflow-hidden group/card hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-100 rounded-full opacity-50 group-hover/card:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-400 group-hover/card:text-indigo-600">
                           <FiUser className="w-5 h-5"/>
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Buyer Profile</h4>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                          <p className="font-bold text-gray-900 text-base">{order.user?.name || order.customerName || "Anonymous User"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                          <p className="font-medium text-gray-600 text-sm">{order.user?.email || order.customerEmail || "No Email"}</p>
                        </div>
                        {order.shippingAddress?.address && (
                          <div className="pt-2 border-t border-gray-100">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Shipping Address</p>
                             <p className="font-medium text-gray-700 text-sm leading-tight">
                               {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                             </p>
                             {order.shippingAddress.phone && <p className="font-medium text-gray-700 text-sm mt-1">📞 {order.shippingAddress.phone}</p>}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Payment Card */}
                  <div className="bg-indigo-50/30 rounded-4xl p-6 md:p-8 border border-indigo-50 relative overflow-hidden group/card hover:bg-white hover:shadow-lg hover:border-indigo-200 transition-all">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-100/50 rounded-full opacity-50 group-hover/card:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-400 group-hover/card:text-indigo-600">
                           <FiCreditCard className="w-5 h-5"/>
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-indigo-900">Financial Ledger</h4>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Total Revenue</p>
                          <p className="font-black text-indigo-600 text-2xl tracking-tight leading-none">₹{order.totalAmount?.toLocaleString()}</p>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                            <div>
                               <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Coupon Applied</p>
                               <p className="text-xs font-bold text-emerald-800">{order.couponApplied || "Discount"}</p>
                            </div>
                            <p className="text-sm font-black text-emerald-600">-₹{order.discountAmount}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.paymentStatus === 'Refunded' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {order.paymentStatus || "Pending"}
                           </span>
                           <span className="text-[10px] font-bold text-gray-500">{order.paymentMethod}</span>
                        </div>
                    </div>
                  </div>

                  {/* Actions Full Width */}
                  <div className="sm:col-span-2 bg-gray-50/50 rounded-4xl p-6 md:p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:border-gray-200">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* Status Select */}
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <FiCheckCircle className="w-3.5 h-3.5"/> Override Status
                          </p>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order._id, e.target.value)}
                              disabled={order.status === "Delivered" || order.status === "Cancelled" || order.returnRequestStatus === "Refunded"}
                              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 transition-all hover:border-indigo-300"
                            >
                              <option value="Pending">Pending (Awaiting Action)</option>
                              <option value="Processing">Processing (Packaged)</option>
                              <option value="Shipped">Shipped (In Transit)</option>
                              <option value="Delivered">Delivered (Finalized)</option>
                              <option value="Cancelled">Cancelled (Aborted)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                        </div>

                        {/* Returns Engine */}
                        {(order.returnRequestStatus !== "None" && order.returnRequestStatus) && (
                           <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                 <FiCornerUpLeft className="w-3.5 h-3.5"/> Return Engine
                              </p>
                              
                              {order.returnRequestStatus === "Requested" && (
                                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                   <p className="text-xs font-black text-orange-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Requires Authorization
                                   </p>
                                   <div className="bg-white/60 p-2 rounded text-xs font-semibold text-orange-900/80 mb-3 italic">
                                     "{order.returnReason}"
                                   </div>
                                   <div className="flex gap-2">
                                     <button onClick={() => approveReturn(order._id)} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black tracking-widest uppercase text-[10px] py-3 rounded-lg shadow-md shadow-orange-600/20 transition-all active:scale-95">
                                       Verify & Authorize
                                     </button>
                                     <button onClick={() => rejectReturn(order._id)} className="flex-1 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 font-black tracking-widest uppercase text-[10px] py-3 rounded-lg shadow-sm transition-all active:scale-95">
                                       Reject Return
                                     </button>
                                   </div>
                                 </div>
                              )}

                              {order.returnRequestStatus === "Approved" && (
                                 <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                                   <p className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                     <FiAlertCircle className="w-4 h-4 text-indigo-600" /> Awaiting Physical Product
                                   </p>
                                   <p className="text-[10px] font-bold text-indigo-600/80 mb-4 leading-relaxed">Do not process until the product is physically received at the warehouse.</p>
                                   <button onClick={() => executeRefund(order._id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-lg shadow-md shadow-indigo-600/20 transition-all active:scale-95">
                                     Execute Final Refund
                                   </button>
                                 </div>
                              )}

                              {order.returnRequestStatus === "Refunded" && (
                                <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-3 shadow-inner">
                                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                                      <FiCheckCircle className="w-4 h-4" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Return Finalized</p>
                                     <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Stock Restored & Refunded</p>
                                   </div>
                                </div>
                              )}

                              {order.returnRequestStatus === "Rejected" && (
                                 <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-200 flex items-center justify-center gap-3 shadow-inner">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500">
                                       <FiXCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-red-800 uppercase tracking-widest">Return Rejected</p>
                                      <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest">Request Denied</p>
                                    </div>
                                 </div>
                               )}
                           </div>
                        )}

                     </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100 shadow-inner">
               <FiBox className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">No Active Orders</h3>
            <p className="text-sm font-medium text-gray-500 max-w-sm">
              Your platform currently has no active transactions. Once customers complete checkout, orders will populate here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
