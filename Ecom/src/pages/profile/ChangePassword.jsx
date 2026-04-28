import { useState } from "react";
import { FiLock } from "react-icons/fi";
import api from "../../api/axios";

const ChangePassword = () => {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: current,
        newPassword: password
      });
      alert(res.data.message || "Password updated successfully");
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-2xl">
      {/* ===== HEADER ===== */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Login & Security
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* ===== SECURITY CARD ===== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <FiLock size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Change Password
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Use a strong password for better security.
            </p>
          </div>
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              Current Password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all font-medium text-gray-900 shadow-inner"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all font-medium text-gray-900 shadow-inner"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-gray-50/50 px-5 py-3.5 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all font-medium text-gray-900 shadow-inner"
            />
          </div>

          {/* ACTION */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-white
                         bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700
                         transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
