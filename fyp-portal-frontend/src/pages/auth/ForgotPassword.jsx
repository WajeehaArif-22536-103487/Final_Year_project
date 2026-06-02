import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, Send, GraduationCap } from "lucide-react";
import API from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setEmailSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-800 to-emerald-900">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-white/50 text-sm mt-1">
                Enter your email to receive a reset link
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="University Email"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Reset Link
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 text-white/50 text-sm font-medium hover:text-white/80 transition-all py-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Check Your Email</h2>
                <p className="text-white/60 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-white/40 text-xs">
                  The link will expire in 1 hour. Please check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-semibold transition-all"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;