import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const user = await login(email, password);
      console.log("Logged in user:", user);

      /* 
        🔥 OTP SYSTEM TEMPORARILY DISABLED
        No email verification required
      */

      // ✅ PROFESSIONAL ROLE-BASED REDIRECT
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "seller") {
        navigate("/seller", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      
      {/* LEFT: Branding/Marketing Panel (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-900 via-indigo-900 to-primary-800 relative overflow-hidden flex-col justify-between p-12 lg:p-24 shadow-2xl z-10">
        
        {/* Dynamic Abstract Decorators */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
        
        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="text-3xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity">
            By Verse
          </Link>
        </div>
        
        {/* Marketing Copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-200 text-xs font-bold uppercase tracking-widest shadow-lg">
            Welcome Back
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Elevate Your <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-primary-300 to-indigo-300">Modern Lifestyle.</span>
          </h2>
          <p className="text-lg text-primary-100 max-w-md font-medium leading-relaxed opacity-90">
            Sign in to access your curated dashboard, exclusive offers, and lightning-fast checkout experiences tailored precisely for you.
          </p>
        </div>
        
        {/* Legal / Sub-footer */}
        <div className="relative z-10 flex items-center gap-4 text-primary-200/60 text-sm font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} By Verse</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>
          <Link to="#" className="hover:text-primary-100 transition-colors">Terms</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>
          <Link to="#" className="hover:text-primary-100 transition-colors">Privacy</Link>
        </div>
      </div>

      {/* RIGHT: Login Form Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-50/50">
        
        {/* Background blobs for form side (subtle) */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>

        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-100/40 rounded-4xl p-8 md:p-12 relative z-10">
          
          {/* Mobile Logo Fallback */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block text-3xl font-extrabold bg-linear-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              By Verse
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              Enter your credentials to securely access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold uppercase tracking-wider ml-1 ${errors.email ? 'text-red-500' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="text"
                placeholder="you@example.com"
                className={`w-full rounded-2xl border px-5 py-4 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.email ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                value={email}
                onChange={(e) => { 
                  const val = e.target.value.replace(/\s/g, '');
                  setEmail(val); 
                  if(errors.email) setErrors({...errors, email: null}); 
                }}
              />
              {errors.email && <span className="text-xs font-bold text-red-500 ml-2">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
               <div className="flex justify-between items-center ml-1">
                 <label className={`block text-xs font-bold uppercase tracking-wider ${errors.password ? 'text-red-500' : 'text-gray-700'}`}>
                   Password
                 </label>
                 {/* <Link to="#" className="text-xs font-extrabold text-primary-600 hover:text-indigo-700 transition-colors">
                   Forgot Password?
                 </Link> */}
               </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full rounded-2xl border px-5 py-4 bg-white/50 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${errors.password ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300'}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: null}); }}
              />
              {errors.password && <span className="text-xs font-bold text-red-500 ml-2">{errors.password}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 mt-2 rounded-2xl font-black text-white shadow-xl shadow-indigo-200/50
                bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 
                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95
                ${submitting ? "opacity-70 cursor-wait shadow-none hover:translate-y-0" : ""}`}
            >
              {submitting ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-600">
              New to By Verse?{" "}
              <Link
                to="/register"
                className="text-primary-600 font-extrabold hover:text-indigo-700 hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
