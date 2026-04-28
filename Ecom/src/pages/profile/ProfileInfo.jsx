import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const ProfileInfo = () => {
  const { user, updateLocalUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name cannot be empty");
    
    setSubmitting(true);
    try {
      await api.put("/user/profile", { name });
      
      // Keep UX instantly synced everywhere across the application DOM
      if (updateLocalUser) {
        updateLocalUser({ name });
      }
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* ===== HEADER ===== */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Profile Information
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your personal details and keep your account up to date.
        </p>
      </div>

      {/* ===== CARD ===== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleUpdate} className="space-y-6">

          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all font-medium text-gray-900 shadow-inner"
              placeholder="Enter your full name"
            />
          </div>

          {/* EMAIL */}
          <div>
             <div className="flex justify-between items-baseline mb-2">
                <label className="block text-sm font-bold text-gray-700">
                Email Address
                </label>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">Read Only</span>
             </div>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-5 py-3.5 rounded-xl
                         bg-gray-100 text-gray-500 border border-gray-200
                         cursor-not-allowed font-medium opacity-80"
            />
          </div>

          {/* ACTION */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3.5 rounded-xl text-base font-bold text-white shadow-lg w-full sm:w-auto
                         bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700
                         transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5
                         ${submitting ? "opacity-70 cursor-wait shadow-none hover:translate-y-0" : ""}`}
            >
              {submitting ? "Updating..." : "Update Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;
