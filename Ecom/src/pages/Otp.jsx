import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 Email coming from Register page
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const otpRefs = useRef([]);

  // 🚫 If user directly opens OTP page
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  /* ================= OTP INPUT ================= */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setMessage("Please enter complete OTP");
      return;
    }

    try {

      // ❌ OTP SYSTEM DISABLED
      /*
      await axios.post("http://localhost:5000/api/auth/otp/verify", {
        email,
        code: finalOtp,
      });
      */

      setMessage("OTP system is temporarily disabled ✅");

      // ✅ Direct redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl p-10 max-w-md w-full border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Verify OTP
        </h2>

        <p className="text-center text-white/90 mb-6">
          OTP system is temporarily disabled.
        </p>

        {/* ❌ OTP INPUTS KEPT FOR STRUCTURE PURPOSE ONLY */}
        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-white/80 focus:ring-2 focus:ring-indigo-500"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
            />
          ))}
        </div>

        <button
          onClick={handleVerifyOtp}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Continue to Login
        </button>

        {message && (
          <p className="text-center mt-4 text-yellow-200 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Otp;
