import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiCornerUpLeft, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm shadow-yellow-100",
  Processing: "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100",
  Shipped: "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm shadow-indigo-100",
  Delivered: "bg-green-100 text-green-700 border border-green-200 shadow-sm shadow-green-100",
  Cancelled: "bg-red-100 text-red-700 border border-red-200 shadow-sm shadow-red-100",
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data.orders);
    } catch (error) {
      console.error("Failed to load seller orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  const approveReturn = async (orderId) => {
    if (!window.confirm("Approve this return request?")) return;
    try {
      await api.put(`/seller/orders/${orderId}/return-approve`);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve return");
    }
  };

  const rejectReturn = async (orderId) => {
    if (!window.confirm("Reject this return request?")) return;
    try {
      await api.put(`/seller/orders/${orderId}/return-reject`);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject return");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading orders...
      </div>
    );
  }

  /* ================= CALCULATE TOTAL EARNINGS ================= */
  const totalRevenue = orders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce(
        (itemSum, item) => itemSum + item.price * item.qty,
        0
      )
    );
  }, 0);

  return (
    <div className="max-w-6xl space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Orders for My Products
          </h2>
          <p className="text-lg font-medium text-gray-500 mt-2">
            Manage and track customer orders in real-time.
          </p>
        </div>

        <div className="bg-linear-to-br from-primary-600 to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/30 flex flex-col items-center sm:items-end min-w-[200px]">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">
            Total Revenue
          </p>
          <p className="text-3xl font-extrabold">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= EMPTY ================= */}
      {orders.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-lg text-gray-500 font-medium">
            Orders for your products will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >

              {/* ================= ORDER HEADER ================= */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider uppercase text-gray-400">
                    Customer
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {order.user?.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    {order.user?.email || "No Email"}
                  </p>
                  {order.shippingAddress?.address && (
                    <div className="mt-2 pt-2 border-t border-gray-100/50">
                       <p className="text-xs font-bold text-gray-400 capitalize mb-0.5">Shipping Destination</p>
                       <p className="text-sm font-medium text-gray-700 leading-tight">
                          {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                       </p>
                       {order.shippingAddress.phone && <p className="text-xs font-medium text-gray-500 mt-1">📞 {order.shippingAddress.phone}</p>}
                    </div>
                  )}
                </div>

                <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`hidden sm:inline-block px-4 py-1.5 text-xs rounded-full font-extrabold tracking-wide uppercase shadow-sm ${
                      statusStyles[order.status]
                    }`}
                  >
                    {order.status}
                  </span>

                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={order.status === "Delivered" || order.status === "Cancelled" || order.returnRequestStatus === "Refunded"}
                      className="bg-white border border-gray-200 rounded-lg pr-8 pl-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                       <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ORDER ITEMS ================= */}
              <div className="divide-y divide-gray-50 px-2 leading-relaxed">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 px-6 py-5 hover:bg-gray-50/50 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-white">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 mb-1">
                          {item.name}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          ₹{item.price} <span className="mx-1 text-gray-300">×</span> {item.qty}
                        </p>
                      </div>
                    </div>

                    <div className="text-lg font-extrabold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl border border-primary-100">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= ORDER FOOTER & RETURN ENGINE ================= */}
              <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">
                    {/* Order #{order._id.slice(-6).toUpperCase()} */}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</span>
                    ₹{order.items.reduce(
                      (sum, item) => sum + item.price * item.qty,
                      0
                    ).toLocaleString()}
                  </p>
                </div>

                {/* Returns Engine (Seller side) */}
                {(order.returnRequestStatus !== "None" && order.returnRequestStatus) && (
                   <div className="w-full md:w-auto md:max-w-sm flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <FiCornerUpLeft className="w-3.5 h-3.5"/> Return Engine
                      </p>
                      
                      {order.returnRequestStatus === "Requested" && (
                         <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 w-full">
                           <p className="text-xs font-black text-orange-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Requires Authorization
                           </p>
                           <div className="bg-white/60 p-2 rounded-lg text-xs font-semibold text-orange-900/80 mb-3 italic">
                             "{order.returnReason}"
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => approveReturn(order._id)} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black tracking-widest uppercase text-[10px] py-2 rounded-lg shadow-md shadow-orange-600/20 transition-all active:scale-95">
                               Approve
                             </button>
                             <button onClick={() => rejectReturn(order._id)} className="flex-1 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 font-black tracking-widest uppercase text-[10px] py-2 rounded-lg shadow-sm transition-all active:scale-95">
                               Reject
                             </button>
                           </div>
                         </div>
                      )}

                      {order.returnRequestStatus === "Approved" && (
                         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                           <p className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                             <FiAlertCircle className="w-4 h-4 text-indigo-600" /> Authorized
                           </p>
                           <p className="text-[10px] font-bold text-indigo-600/80 leading-relaxed max-w-xs">Return has been approved. The Administrator will execute the final refund once physical product delivery is confirmed.</p>
                         </div>
                      )}

                      {order.returnRequestStatus === "Refunded" && (
                        <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-3 shadow-inner">
                           <div className="w-8 h-8 bg-white rounded-full flex shrink-0 items-center justify-center shadow-sm text-emerald-500">
                              <FiCheckCircle className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Finalized</p>
                             <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Stock Restored</p>
                           </div>
                        </div>
                      )}

                      {order.returnRequestStatus === "Rejected" && (
                        <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3 shadow-inner">
                           <div className="w-8 h-8 bg-white rounded-full flex shrink-0 items-center justify-center shadow-sm text-red-500">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
