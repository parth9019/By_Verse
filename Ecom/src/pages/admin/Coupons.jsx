import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiPlus, FiTrash2, FiPower, FiCopy, FiSearch, FiFilter, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    expiryDate: "",
    allowedUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      console.error("Failed to load users for dropdown");
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupons", form);
      // Reset form
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        expiryDate: "",
        allowedUsers: [],
      });
      setShowForm(false);
      showToast("Coupon successfully created!");
      fetchCoupons();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create coupon.", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/coupons/${id}/toggle`);
      showToast("Coupon status updated.");
      fetchCoupons();
    } catch {
      showToast("Failed to toggle status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast("Coupon deleted successfully.");
      fetchCoupons();
    } catch {
      showToast("Failed to delete coupon", "error");
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-400 font-bold uppercase tracking-wider text-sm flex justify-center">Loading Coupons...</div>;
  }

  // ✅ Apply Filtering Logic
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());

    const isExpired = new Date() > new Date(coupon.expiryDate);
    // Active if manually toggled ON AND not past expiry
    const isActiveStatus = coupon.isActive && !isExpired;

    let matchesStatus = true;
    if (filterStatus === "active") matchesStatus = isActiveStatus;
    if (filterStatus === "expired") matchesStatus = !isActiveStatus;

    let matchesType = true;
    if (filterType !== "all") matchesType = coupon.discountType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Promotions & Coupons</h1>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest">
            Manage Discounts and Targeted Offers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {showForm ? "Cancel" : <><FiPlus className="w-5 h-5" /> Generate Coupon</>}
        </button>
      </div>

      {/* Filters UI */}
      {!showForm && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Coupon Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl py-3 pl-12 pr-4 font-bold text-gray-800 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 w-full md:w-auto">
              <FiFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent font-bold text-gray-600 outline-none cursor-pointer py-2 focus:text-indigo-600 w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired / Paused</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 w-full md:w-auto">
              <span className="text-gray-400 font-bold ml-1">%</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent font-bold text-gray-600 outline-none cursor-pointer py-2 focus:text-indigo-600 w-full"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Creation Form */}
      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">Create New Campaign</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-extrabold text-gray-900 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Type *</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Value *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={form.discountType === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 500 for ₹500'}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Min. Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2000 (Optional)"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiry Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

            </div>

            {/* Targeted Users Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Targeted Emails (Optional)</label>

              <div
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer min-h-[50px] flex flex-wrap gap-2 items-center bg-white"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {form.allowedUsers.length === 0 ? (
                  <span className="text-gray-400 font-bold">Select Users (Global if empty)</span>
                ) : (
                  form.allowedUsers.map(email => (
                    <span key={email} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      {email}
                      <span className="cursor-pointer text-indigo-400 hover:text-indigo-900 bg-indigo-200 rounded-sm w-4 h-4 flex items-center justify-center transition-colors" onClick={(e) => {
                        e.stopPropagation();
                        setForm({ ...form, allowedUsers: form.allowedUsers.filter(e => e !== email) });
                      }}>×</span>
                    </span>
                  ))
                )}
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-4 text-sm font-bold text-gray-400 text-center">Loading users...</div>
                  ) : (
                    users.map(user => {
                      const isSelected = form.allowedUsers.includes(user.email);
                      return (
                        <div
                          key={user._id}
                          className={`p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors last:border-b-0 ${isSelected ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setForm({ ...form, allowedUsers: form.allowedUsers.filter(e => e !== user.email) });
                            } else {
                              setForm({ ...form, allowedUsers: [...form.allowedUsers, user.email] });
                            }
                          }}
                        >
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm tracking-tight">{user.name}</p>
                            <p className="text-gray-400 text-xs font-bold">{user.email}</p>
                          </div>
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200'}`}>
                            {isSelected && <span className="text-xs font-black">✓</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Publish Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Coupons */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🎫</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No coupons found</h3>
          <p className="text-gray-500 font-medium">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const isExpired = new Date() > new Date(coupon.expiryDate);
            return (
              <div
                key={coupon._id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden ${!coupon.isActive || isExpired
                  ? "border-gray-200 opacity-70 grayscale-30"
                  : "border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.15)] hover:-translate-y-1"
                  }`}
              >
                {/* Decorative cutouts to look like a ticket */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2"></div>

                <div className="border-b border-dashed border-gray-200 pb-5 mb-5 pl-2 pr-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${coupon.isActive && !isExpired ? "bg-emerald-100 text-emerald-700" : isExpired ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>
                      {isExpired ? "Expired" : coupon.isActive ? "Active" : "Paused"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(coupon._id)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 rounded-lg hover:bg-indigo-50">
                        <FiPower className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-lg hover:bg-red-50">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group">
                    <h2 className="text-2xl font-black text-gray-900 tracking-widest uppercase">{coupon.code}</h2>
                    <FiCopy className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 cursor-pointer transition-colors" />
                  </div>
                </div>

                <div className="pl-2 pr-2 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Discount</span>
                    <span className="font-extrabold text-indigo-600">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">Min. Spend</span>
                    <span className="font-bold text-gray-900">
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'None'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">Targeted</span>
                    <span className="font-bold text-gray-900">
                      {coupon.allowedUsers?.length > 0 ? `${coupon.allowedUsers.length} Users` : 'Global'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50 mt-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Expires</span>
                    <span className="font-bold text-gray-600 text-xs">
                      {new Date(coupon.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Premium UI Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${toast ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
          }`}
      >
        {toast && (
          <div className="bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-2xl p-4 md:p-5 flex items-center gap-4 min-w-[320px] max-w-sm">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br ${toast.type === "success" ? "from-emerald-400 to-emerald-600 shadow-emerald-200" : "from-red-400 to-red-600 shadow-red-200"
              } shadow-lg text-white`}>
              {toast.type === "success" ? <FiCheckCircle size={22} className="opacity-90" /> : <FiAlertCircle size={22} className="opacity-90" />}
            </div>
            <div>
              <p className={`text-[11px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                {toast.type === "success" ? "System Update" : "Action Failed"}
              </p>
              <p className="text-gray-800 font-extrabold text-[15px] mt-0.5 leading-tight">{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
