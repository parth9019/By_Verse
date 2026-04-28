import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiX, FiDownload } from "react-icons/fi";
import Modal from "../components/Modal";

const statusStyles = {
  Pending: "bg-yellow-100/80 text-yellow-800 border border-yellow-200",
  Processing: "bg-blue-100/80 text-blue-800 border border-blue-200",
  Shipped: "bg-indigo-100/80 text-indigo-800 border border-indigo-200",
  Delivered: "bg-green-100/80 text-green-800 border border-green-200",
  Cancelled: "bg-red-100/80 text-red-800 border border-red-200",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Return State
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Invoice State
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingId(orderId);
      const res = await api.put(`/orders/${orderId}/cancel`);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? res.data.order
            : order
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) return alert("Please provide a reason for the return");
    try {
      setSubmittingReturn(true);
      const res = await api.post(`/orders/${returnOrderId}/return`, { reason: returnReason });
      setOrders(prev => prev.map(o => o._id === returnOrderId ? res.data.order : o));
      setReturnOrderId(null);
      setReturnReason("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const isReturnEligible = (order) => {
    if (order.status !== "Delivered" || (order.returnRequestStatus && order.returnRequestStatus !== "None")) return false;

    // Fallback to updatedAt for older seller orders that were marked delivered before deliveredAt was tracked
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    return (new Date() - deliveryDate) <= SEVEN_DAYS_MS;
  };

  const canShowInvoice = (order) => {
    return order.status !== "Cancelled" && order.paymentStatus !== "Refunded" && (!order.returnRequestStatus || order.returnRequestStatus === "None");
  };

  const handleDownloadInvoice = (order) => {
    const printWindow = window.open('', '_blank');

    // De-compile pricing logic mathematically to avoid backend mutations
    const baseTotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountedTotal = baseTotal - (order.discountAmount || 0);
    const shippingCharge = baseTotal > 1000 ? 149 : 0;
    const gstAmount = Math.round(discountedTotal * 0.18);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - #${order._id.slice(-6).toUpperCase()}</title>
          <style>
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
             * { box-sizing: border-box; }
             body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #111827; background: #fff; }
             .invoice-box { max-width: 800px; margin: auto; padding: 50px; }
             .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 30px; margin-bottom: 40px; }
             .header h1 { margin: 0; font-size: 40px; font-weight: 900; text-transform: uppercase; color: #111827; letter-spacing: -1px; }
             .header .subtitle { color: #6b7280; font-size: 15px; margin-top: 4px; font-weight: 500; }
             .company-details { text-align: right; }
             .company-details h2 { margin: 0; font-size: 28px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; }
             .company-details p { margin: 4px 0 0 0; color: #6b7280; font-size: 14px; font-weight: 500; }
             
             .billing-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
             .bill-to .title, .invoice-info .title { font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
             .bill-to h3 { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #111827; }
             .bill-to p { margin: 2px 0; font-size: 14px; color: #4b5563; font-weight: 500; }
             
             .invoice-info table { text-align: right; border-collapse: collapse; margin-left: auto; }
             .invoice-info td { padding: 4px 0 4px 16px; font-size: 14px; }
             .invoice-info td.label { color: #6b7280; font-weight: 500; }
             .invoice-info td.value { font-weight: 700; color: #111827; }
             
             .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
             .items-table th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #6b7280; letter-spacing: 1.5px; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; }
             .items-table th.center { text-align: center; }
             .items-table th.right { text-align: right; }
             .items-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 15px; color: #4b5563; font-weight: 500; }
             .items-table td.name { font-weight: 700; color: #111827; }
             .items-table td.center { text-align: center; }
             .items-table td.right { text-align: right; font-weight: 700; color: #111827; }
             
             .totals { width: 100%; max-width: 350px; margin-left: auto; border-collapse: collapse; }
             .totals td { padding: 10px 16px; font-size: 15px; color: #6b7280; font-weight: 500; }
             .totals td.right { text-align: right; font-weight: 700; color: #111827; }
             .totals tr.grand-total td { font-size: 14px; font-weight: 900; color: #111827; border-top: 2px solid #111827; padding-top: 16px; text-transform: uppercase; letter-spacing: 1px; }
             .totals tr.grand-total td.right { font-size: 24px; }
             
             .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; font-weight: 500; }
             .footer .note { font-size: 12px; color: #9ca3af; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
             <div class="header">
                <div>
                   <h1>Invoice</h1>
                   <div class="subtitle">Receipt for Order</div>
                </div>
                <div class="company-details">
                   <h2>BuyVerse</h2>
                   <p>123 E-Commerce Blvd.</p>
                   <p>Tech District, 10001</p>
                   <p>support@buyverse.com</p>
                </div>
             </div>
             
             <div class="billing-grid">
               <div class="bill-to">
                 <div class="title">Billed To</div>
                 <h3>${order.customerName || order.user?.name || 'Customer'}</h3>
                 <p>${order.shippingAddress?.address || 'Address Not Provided'}</p>
                 <p>${order.shippingAddress?.city || ''} ${order.shippingAddress?.postalCode || ''}</p>
               </div>
               <div class="invoice-info">
                 <div class="title" style="text-align: right; margin-bottom: 8px;">Invoice Details</div>
                 <table>
                   <tr><td class="label">Invoice No:</td><td class="value">#${order._id.slice(-6).toUpperCase()}</td></tr>
                   <tr><td class="label">Date:</td><td class="value">${new Date(order.createdAt).toLocaleDateString()}</td></tr>
                   <tr><td class="label">Status:</td><td class="value" style="color: #059669; text-transform: uppercase;">Paid</td></tr>
                 </table>
               </div>
             </div>
             
             <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="center">Qty</th>
                    <th class="right">Price</th>
                    <th class="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td class="name">${item.name}</td>
                      <td class="center">${item.qty}</td>
                      <td class="right">₹${item.price}</td>
                      <td class="right">₹${item.price * item.qty}</td>
                    </tr>
                  `).join('')}
                </tbody>
             </table>
             
             <table class="totals">
                <tr>
                  <td>Subtotal</td>
                  <td class="right">₹${baseTotal}</td>
                </tr>
                <tr>
                  <td>Discount</td>
                  <td class="right" style="color: #059669;">-₹${order.discountAmount || 0}</td>
                </tr>
                <tr>
                  <td>Estimated GST (18%)</td>
                  <td class="right">+₹${gstAmount}</td>
                </tr>
                <tr>
                  <td>Shipping Fee</td>
                  <td class="right">${shippingCharge === 0 ? '<span style="color: #059669; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; font-weight: 900;">Free</span>' : '+₹' + shippingCharge}</td>
                </tr>
                <tr class="grand-total">
                  <td>Grand Total</td>
                  <td class="right">₹${order.totalAmount}</td>
                </tr>
             </table>
             
             <div class="footer">
                Thank you for shopping with BuyVerse.
                <div class="note">This is a computer-generated document. No signature is required.</div>
             </div>
          </div>
          <script>
             window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;

    const searchL = (searchTerm || "").toLowerCase().trim();
    if (!searchL) return matchesStatus;

    const safeId = String(order._id || "").toLowerCase();
    const idMatch = safeId.includes(searchL);

    const itemMatch = Array.isArray(order.items) && order.items.some(item => {
      const safeName = String(item.name || "").toLowerCase();
      return safeName.includes(searchL);
    });

    return matchesStatus && (idMatch || itemMatch);
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
        <div className="w-24 h-24 mb-6 bg-gray-50 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          No orders yet
        </h2>
        <p className="text-gray-500 text-lg max-w-md">
          Looks like you haven’t placed any orders. Discover our latest products and treat yourself!
        </p>
        <Link
          to="/"
          className="mt-8 px-8 py-4 bg-linear-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-medium w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-4 sm:px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
            <FiFilter className="text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm w-full font-bold text-gray-600 outline-none cursor-pointer focus:text-primary-600 appearance-none sm:appearance-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-bold mb-2">No nested orders found.</p>
          <button onClick={() => { setSearchTerm(""); setFilterStatus("All"); }} className="text-primary-600 font-bold hover:underline">Clear filters</button>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* HEADER */}
            <div className="px-4 sm:px-6 md:px-8 py-5 bg-gray-50/80 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit text-center ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    Order Placed
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200/60">
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                    Total Amount
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    ₹{order.totalAmount}
                  </p>
                </div>
                {order.discountAmount > 0 && (
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-wider mt-0.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 shrink-0">
                    Saved ₹{order.discountAmount}
                  </p>
                )}
              </div>
            </div>

            {/* ITEMS */}
            <div className="divide-y divide-gray-100 w-full">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-row items-center gap-4 sm:gap-6"
                >
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl w-16 h-16 sm:w-24 sm:h-24 shrink-0 p-1 sm:p-1.5 border border-gray-100">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply rounded-lg sm:rounded-xl"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-sm sm:text-lg text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 rounded-md text-xs sm:text-sm font-semibold text-gray-600">Qty: {item.qty}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-500 truncate"> ₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="font-extrabold text-base sm:text-xl text-gray-900 shrink-0 text-right">
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION / STATUS BAR */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Dynamic Badges for Returns / Refunds */}
              <div className="w-full sm:w-auto text-left flex shrink-0">
                {order.returnRequestStatus && order.returnRequestStatus !== "None" ? (
                  <div className="inline-flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 w-full sm:w-auto bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 truncate">
                      Return: <span className="uppercase tracking-wider">{order.returnRequestStatus}</span>
                    </span>
                  </div>
                ) : order.paymentStatus === "Refunded" ? (
                  <div className="inline-flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 w-full sm:w-auto bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 truncate">Payment Refunded</span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 flex-wrap sm:flex-nowrap justify-end">
                {canShowInvoice(order) && (
                  <>
                    <button
                      onClick={() => setViewingInvoice(order)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm md:hover:shadow-md md:hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm md:hover:shadow-md md:hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                    >
                      Download Invoice
                    </button>
                  </>
                )}

                {(order.status === "Pending" || order.status === "Processing" || order.status === "Confirmed") && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    disabled={cancellingId === order._id}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm whitespace-nowrap
                      ${cancellingId === order._id
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-md md:hover:-translate-y-0.5 active:scale-95"
                      }`}
                  >
                    {cancellingId === order._id ? "Processing..." : "Cancel Order"}
                  </button>
                )}

                {isReturnEligible(order) && (
                  <button
                    onClick={() => setReturnOrderId(order._id)}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm md:hover:shadow-md md:hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                  >
                    Return Product
                  </button>
                )}
              </div>
            </div>
          </div>
        )))}

      {/* RETURN MODAL */}
      <Modal
        isOpen={!!returnOrderId}
        onClose={() => { setReturnOrderId(null); setReturnReason(""); }}
        title="Request Order Return"
      >
        <div className="p-2">
          <p className="text-gray-600 font-medium mb-4">
            Please tell us why you are returning this order so we can improve our services. Once approved by the vendor or our support team, we'll process your physical pickup and refund.
          </p>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Ex: The product size did not fit me..."
            className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-6 shadow-inner text-gray-800 font-medium"
          ></textarea>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setReturnOrderId(null); setReturnReason(""); }}
              className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={submitReturnRequest}
              disabled={submittingReturn || !returnReason.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {submittingReturn ? "Submitting..." : "Submit Return"}
            </button>
          </div>
        </div>
      </Modal>

      {/* FULL PAGE INVOICE OVERLAY (Replacing Standard Modal) */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-100 bg-gray-900/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 custom-scrollbar">

          <div className="max-w-4xl mx-auto mb-4 flex justify-end print:hidden">
            <button onClick={() => setViewingInvoice(null)} className="flex items-center gap-2 text-white/80 hover:text-white font-bold bg-gray-800/50 hover:bg-red-500/90 px-4 py-2 rounded-xl transition-all backdrop-blur-md shadow-lg">
              <FiX size={20} /> Close View
            </button>
          </div>

          <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-2xl relative p-6 sm:p-14">

            {/* A4 Content Area Desktop Representation */}
            <div className="text-gray-800 mt-12 sm:mt-0">
              {/* Professional Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-900 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Invoice</h1>
                  <p className="text-gray-500 font-medium mt-1">Receipt for Order</p>
                </div>
                <div className="mt-6 sm:mt-0 sm:text-right">
                  <h2 className="text-3xl font-black text-indigo-600 tracking-tighter">BuyVerse</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">123 E-Commerce Blvd.</p>
                  <p className="text-sm font-medium text-gray-500">Tech District, 10001</p>
                  <p className="text-sm font-medium text-gray-500">support@buyverse.com</p>
                </div>
              </div>

              {/* Billing Grid */}
              <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
                <div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{viewingInvoice.customerName || viewingInvoice.user?.name || 'Customer'}</h4>
                  <p className="text-sm text-gray-600 font-medium">{viewingInvoice.shippingAddress?.address || 'Address Not Provided'}</p>
                  <p className="text-sm text-gray-600 font-medium">{viewingInvoice.shippingAddress?.city || ''} {viewingInvoice.shippingAddress?.postalCode || ''}</p>
                </div>
                <div className="sm:text-right">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Invoice Details</h3>
                  <table className="w-full text-right sm:ml-auto max-w-[200px]">
                    <tbody>
                      <tr>
                        <td className="text-sm text-gray-500 font-medium pr-4 pb-1">Invoice No:</td>
                        <td className="text-sm text-gray-900 font-bold pb-1">#{viewingInvoice._id.slice(-6).toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="text-sm text-gray-500 font-medium pr-4 pb-1">Date:</td>
                        <td className="text-sm text-gray-900 font-bold pb-1">{new Date(viewingInvoice.createdAt).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td className="text-sm text-gray-500 font-medium pr-4">Status:</td>
                        <td className="text-sm text-emerald-600 font-black uppercase">Paid</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto w-full mb-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-widest border-y-2 border-gray-200 min-w-[200px]">Description</th>
                      <th className="py-3 px-4 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-widest border-y-2 border-gray-200 text-center">Qty</th>
                      <th className="py-3 px-4 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-widest border-y-2 border-gray-200 text-right">Price</th>
                      <th className="py-3 px-4 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-widest border-y-2 border-gray-200 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 border-b border-gray-200">
                    {viewingInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-0 min-w-full">{item.name}</td>
                        <td className="py-4 px-4 font-medium text-gray-600 text-center">{item.qty}</td>
                        <td className="py-4 px-4 font-medium text-gray-600 text-right whitespace-nowrap">₹{item.price}</td>
                        <td className="py-4 px-4 font-black text-gray-900 text-right whitespace-nowrap">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              {(() => {
                const baseTotal = viewingInvoice.items.reduce((sum, item) => sum + item.price * item.qty, 0);
                const discountedTotal = baseTotal - (viewingInvoice.discountAmount || 0);
                const shippingCharge = baseTotal > 1000 ? 149 : 0;
                const gstAmount = Math.round(discountedTotal * 0.18);

                return (
                  <table className="w-full sm:max-w-xs ml-auto text-right border-collapse mb-10">
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 text-gray-500 font-medium">Subtotal</td>
                        <td className="py-2 px-4 text-gray-900 font-bold">₹{baseTotal}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-gray-500 font-medium">Discount</td>
                        <td className="py-2 px-4 text-emerald-600 font-bold">-₹{viewingInvoice.discountAmount || 0}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-gray-500 font-medium">GST <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1 font-bold">18%</span></td>
                        <td className="py-2 px-4 text-gray-900 font-bold">+₹{gstAmount}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-500 font-medium border-b border-gray-100">Shipping</td>
                        <td className="py-3 px-4 text-gray-900 font-bold border-b border-gray-100">
                          {shippingCharge === 0 ? <span className="text-emerald-600 text-xs tracking-wider uppercase font-black">Free</span> : `+₹${shippingCharge}`}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 text-gray-900 font-black uppercase tracking-widest text-sm border-t-2 border-gray-900 pt-4">Grand Total</td>
                        <td className="py-4 px-4 text-gray-900 font-black text-2xl border-t-2 border-gray-900 pt-4">₹{viewingInvoice.totalAmount}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 text-center mt-12 mb-8">
                <p className="text-gray-500 font-medium text-sm">Thank you for shopping with BuyVerse.</p>
                <p className="text-gray-400 font-medium text-xs mt-1">This is a computer-generated document. No signature is required.</p>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 print:hidden border-t border-gray-100 pt-6">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadInvoice(viewingInvoice)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FiDownload className="w-5 h-5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
