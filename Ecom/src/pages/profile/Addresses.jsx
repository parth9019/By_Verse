import { useState, useEffect } from "react";
import { FiMapPin, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import api from "../../api/axios";
import Modal from "../../components/Modal";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ address: "", city: "", state: "", country: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/user/addresses");
      setAddresses(res.data);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.state || !form.country || !form.pincode) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/user/addresses", form);
      setAddresses(res.data);
      setIsModalOpen(false);
      setForm({ address: "", city: "", state: "", country: "", pincode: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/user/addresses/${id}/default`);
      setAddresses(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to set default");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await api.delete(`/user/addresses/${id}`);
      setAddresses(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to delete address");
    }
  };

  if (loading) return <div className="text-gray-500 font-bold p-8">Loading addresses...</div>;

  return (
    <div className="max-w-3xl">
      {/* ===== HEADER ===== */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Saved Addresses</h2>
          <p className="text-gray-500 mt-2 text-lg">Manage your delivery addresses for faster checkout.</p>
        </div>
        {addresses.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md"
          >
            <FiPlus size={18} /> Add Address
          </button>
        )}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="mb-6 w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FiMapPin size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 text-lg max-w-sm mb-8">Add an address to make your checkout experience faster and easier.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <FiPlus size={20} /> Add New Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                addr.isDefault ? "border-indigo-500 shadow-md" : "border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${addr.isDefault ? "bg-indigo-100 text-indigo-600" : "bg-gray-50 text-gray-400"}`}>
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 mb-2">
                        <FiStar className="fill-indigo-700" size={10} /> Default
                      </span>
                    )}
                    <p className="text-base font-bold text-gray-900 leading-relaxed max-w-sm">{addr.address}</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                      {addr.city}, {addr.state}, {addr.country} - {addr.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:self-start">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 hover:bg-indigo-50 rounded-lg"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== ADD MODAL ===== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Address">
        <form onSubmit={handleAddAddress} className="space-y-5 mt-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
            <textarea
              required
              rows="3"
              placeholder="123 Example St, Apt 4B..."
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
              <input
                required
                type="text"
                placeholder="Mumbai"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">State</label>
              <input
                required
                type="text"
                placeholder="Maharashtra"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Country</label>
              <input
                required
                type="text"
                placeholder="India"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
              <input
                required
                type="text"
                placeholder="400001"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-75 disabled:scale-100"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Addresses;
