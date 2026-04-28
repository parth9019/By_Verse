import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim() || name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      newErrors.phone = "Please enter a valid 10-digit number";
    }
    
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, phone, password },
        { withCredentials: true }
      );

      // ✅ OTP DISABLED
      // navigate("/otp", { state: { email } });

      // ✅ Direct redirect to login
      navigate("/login");

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      
      {/* LEFT: Branding/Marketing Panel (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-900 via-primary-900 to-indigo-800 relative overflow-hidden flex-col justify-between p-12 lg:p-24 shadow-2xl z-10">
        
        {/* Dynamic Abstract Decorators */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        {/* Logo */}
        <div className="relative z-10">
          <a href="/" className="text-3xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity">
            By Verse
          </a>
        </div>
        
        {/* Marketing Copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-200 text-xs font-bold uppercase tracking-widest shadow-lg">
            Join The Experience
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Unlock Next-Gen <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-primary-300">E-Commerce.</span>
          </h2>
          <p className="text-lg text-indigo-100 max-w-md font-medium leading-relaxed opacity-90">
            Create your account today to streamline your purchases, track orders in real-time, and become an official seller.
          </p>
        </div>
        
        {/* Legal / Sub-footer */}
        <div className="relative z-10 flex items-center gap-4 text-indigo-200/60 text-sm font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} By Verse</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
          <a href="#" className="hover:text-indigo-100 transition-colors">Terms</a>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
          <a href="#" className="hover:text-indigo-100 transition-colors">Privacy</a>
        </div>
      </div>

      {/* RIGHT: Registration Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-50/50">
        
        {/* Background blobs for form side (subtle) */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>

        <div className="w-full max-w-[480px] bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-100/40 rounded-4xl p-8 md:p-10 relative z-10">
          
          {/* Mobile Logo Fallback */}
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="inline-block text-3xl font-extrabold bg-linear-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              By Verse
            </a>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              Setup a new profile to proceed with By Verse.
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">

            <div className="flex flex-col space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${errors.name ? 'text-red-500' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                className={`w-full rounded-2xl border px-5 py-3.5 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.name ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                placeholder="Enter your name"
                onChange={(e) => { 
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setName(val); 
                  if(errors.name) setErrors({...errors, name: null}); 
                }}
                value={name}
              />
              {errors.name && <span className="text-xs font-bold text-red-500 ml-2">{errors.name}</span>}
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${errors.email ? 'text-red-500' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="text"
                className={`w-full rounded-2xl border px-5 py-3.5 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.email ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                placeholder="Enter your email"
                onChange={(e) => { 
                  const val = e.target.value.replace(/\s/g, '');
                  setEmail(val); 
                  if(errors.email) setErrors({...errors, email: null}); 
                }}
                value={email}
              />
              {errors.email && <span className="text-xs font-bold text-red-500 ml-2">{errors.email}</span>}
            </div>

            <div className="flex flex-col space-y-1.5">
               <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${errors.phone ? 'text-red-500' : 'text-gray-700'}`}>
                 Phone Number
               </label>
               <input
                 type="tel"
                 className={`w-full rounded-2xl border px-5 py-3.5 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.phone ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                 placeholder="Enter mobile number"
                 onChange={(e) => { 
                   const val = e.target.value.replace(/\D/g, '');
                   setPhone(val); 
                   if(errors.phone) setErrors({...errors, phone: null}); 
                 }}
                 value={phone}
                 maxLength="10"
               />
               {errors.phone && <span className="text-xs font-bold text-red-500 ml-2">{errors.phone}</span>}
            </div>

            <div className="flex flex-col space-y-1.5">
               <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${errors.password ? 'text-red-500' : 'text-gray-700'}`}>
                 Password
               </label>
               <input
                 type="password"
                 className={`w-full rounded-2xl border px-5 py-3.5 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.password ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                 placeholder="Enter secure password"
                 onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: null}); }}
               />
               {errors.password && <span className="text-xs font-bold text-red-500 ml-2">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-4 rounded-2xl font-black text-white shadow-xl shadow-indigo-200/50 bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              Initialize Account
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-primary-600 font-extrabold hover:text-indigo-700 hover:underline transition-colors">
                Secure Login
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
