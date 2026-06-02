import React, { useState, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    return (
      <div className="p-20 text-red-500 font-bold">
        Error: AuthProvider is missing in App.js!
      </div>
    );
  }

  const { login } = auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = res.data;
      login({ token, user });

      toast.success(`Welcome back, ${user.name}!`);

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher/overview");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        default:
          navigate("/");
          toast.error("Role not recognized. Contact Admin.");
      }
    } catch (err) {
      console.error("Login Error Details:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          /* Override browser autofill to match your glass design */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
            -webkit-text-fill-color: white !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            caret-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          
          /* For Firefox */
          input:-moz-autofill {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
        `}
      </style>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-800 to-emerald-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        </div>

        {/* Main Container */}
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl"
          >
            {/* Glass Card */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Branding */}
                <div className="lg:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-teal-600/90 to-emerald-700/90">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <GraduationCap size={28} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-white font-bold text-2xl">
                          FYP Portal
                        </h1>
                        <p className="text-white/60 text-xs">
                          Final Year Project Management
                        </p>
                      </div>
                    </div>

                    {/* Main Title */}
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      Welcome Back!
                    </h2>
                    <p className="text-white/80 text-base mb-8 leading-relaxed">
                      Sign in to continue your FYP journey and manage your
                      projects efficiently.
                    </p>

                    {/* Features */}
                    <div className="space-y-4 mb-10">
                      {[
                        " Submit and track proposals",
                        " Get real-time feedback",
                        " View grades and evaluations",
                        " Collaborate with supervisors",
                      ].map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-center gap-3 text-white/80 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <p className="text-2xl font-bold text-white">500+</p>
                        <p className="text-xs text-white/60">Students</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">50+</p>
                        <p className="text-xs text-white/60">Teachers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">100+</p>
                        <p className="text-xs text-white/60">Projects</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Side - Login Form */}
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Sign In
                      </h3>
                      <p className="text-white/50 text-sm">
                        Enter your credentials to access your dashboard
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Field */}
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 pt-6 pb-2 rounded-xl bg-white/10 border border-white/20 text-white text-base focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-400 peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          <Mail size={14} className="inline mr-1" /> Email
                          Address
                        </label>
                      </div>

                      {/* Password Field */}
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 pt-6 pb-2 rounded-xl bg-white/10 border border-white/20 text-white text-base focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="password"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-400 peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          <Lock size={14} className="inline mr-1" /> Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      {/* Forgot Password */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          className="text-sm text-white/50 hover:text-teal-400 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <p className="text-xs text-white/30 text-right mt-1">
                        Password must be at least 6 characters
                      </p>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 text-base"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Authenticating...
                          </span>
                        ) : (
                          <>
                            <LogIn size={18} />
                            Login to Dashboard
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <p className="text-center text-sm text-white/60">
                        New Student?{" "}
                        <button
                          onClick={() => navigate("/claim-account")}
                          className="text-teal-400 font-semibold hover:underline transition-all"
                        >
                          Activate your account
                        </button>
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Login;
