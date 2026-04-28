import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

const BecomeSeller = () => {
  const [form, setForm] = useState({
    shopName: "",
    gstNumber: "",
    bankAccount: "",
    ifscCode: "",
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  /* ================= FETCH EXISTING REQUEST ================= */
  const fetchStatus = async () => {
    try {
      const res = await api.get("/seller/my-request");
      setStatus(res.data.status);
    } catch (error) {
      setStatus(null); // no request yet
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= APPLY ================= */
  const handleApply = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/seller/apply", form);

      alert("Seller application submitted successfully 🚀");
      fetchStatus();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to submit application"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="font-medium">Checking application status...</p>
      </div>
    );
  }

  /* ================= STATUS DISPLAY ================= */
  if (status) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto flex flex-col items-center text-center mt-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Application Status
        </h2>

        <div className="flex flex-col items-center gap-6">
          {status === "pending" && (
            <>
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center">
                 <FiClock className="text-yellow-500 w-12 h-12" />
              </div>
              <div>
                <span className="block text-2xl text-yellow-600 font-extrabold mb-2">
                  Review in Progress
                </span>
                <p className="text-gray-500 font-medium">Your application is currently being reviewed by our team. Please check back later.</p>
              </div>
            </>
          )}

          {status === "approved" && (
            <>
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                 <FiCheckCircle className="text-green-500 w-12 h-12" />
              </div>
              <div>
                <span className="block text-2xl text-green-600 font-extrabold mb-2">
                  Welcome Aboard! 🎉
                </span>
                <p className="text-gray-500 font-medium">Your request has been approved. You now have access to the Seller Dashboard!</p>
              </div>
            </>
          )}

          {status === "rejected" && (
            <>
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                 <FiXCircle className="text-red-500 w-12 h-12" />
              </div>
               <div>
                <span className="block text-2xl text-red-600 font-extrabold mb-2">
                  Application Declined
                </span>
                <p className="text-gray-500 font-medium">Unfortunately, your request could not be approved at this time.</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ================= APPLICATION FORM ================= */
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Become a Seller
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Join our marketplace and start selling your products with full seller dashboard access.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={handleApply} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Shop Name</label>
              <input
                type="text"
                name="shopName"
                placeholder="E.g., The Awesome Store"
                value={form.shopName}
                onChange={handleChange}
                required
                className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner"
              />
            </div>

            <div className="sm:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="Your 15-digit GSTIN"
                value={form.gstNumber}
                onChange={handleChange}
                required
                className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner uppercase"
              />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                name="bankAccount"
                placeholder="Bank Account Number"
                value={form.bankAccount}
                onChange={handleChange}
                required
                className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner"
              />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                placeholder="e.g., HDFC0001234"
                value={form.ifscCode}
                onChange={handleChange}
                required
                className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner uppercase"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Submitting Application Form..." : "Apply for Seller Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
