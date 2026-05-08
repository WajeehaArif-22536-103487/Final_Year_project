import React, { useState, useContext } from "react"; 
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 
import API from '../../services/api';
import { toast } from "react-toastify";
import { GraduationCap, UserCheck, Mail, Lock, ArrowLeft, Shield, User, IdCard } from "lucide-react";

const ClaimAccount = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [regNo, setRegNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [creds, setCreds] = useState({ email: "", password: "" });

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const verifyStudent = async () => {
    if (!regNo || !cnic) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-preapproval", { 
        registrationNo: regNo, 
        cnic: cnic 
      });
      
      if (res.data.success) {
        toast.success("Identity Verified!");
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Student not found in pre-approved list");
    } finally {
      setLoading(false);
    }
  };

  const finalizeRegistration = async () => {
    if (!creds.email || !creds.password) return toast.error("Please set email and password");
    setLoading(true);
    try {
      const res = await API.post("/auth/register-student", { 
        registrationNo: regNo, 
        cnic, 
        email: creds.email, 
        password: creds.password 
      });
      
      login(res.data); 
      toast.success("Account activated! Welcome.");
      navigate("/student/dashboard"); 
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-teal-700 to-emerald-600">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Large Circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse-fast"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-fast delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl animate-pulse-fast delay-500"></div>
        
        {/* Medium Circles */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-cyan-400/15 rounded-full blur-2xl animate-pulse-fast delay-300"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl animate-pulse-fast delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse-fast delay-900"></div>
        
        {/* Small Circles */}
        <div className="absolute top-40 left-1/3 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse-fast delay-200"></div>
        <div className="absolute bottom-32 right-1/3 w-20 h-20 bg-emerald-400/15 rounded-full blur-xl animate-pulse-fast delay-600"></div>
        <div className="absolute top-60 right-40 w-12 h-12 bg-cyan-400/20 rounded-full blur-lg animate-pulse-fast delay-400"></div>
        
        {/* Squares */}
        <div className="absolute top-24 left-20 w-16 h-16 bg-teal-400/20 rounded-xl rotate-12 animate-float-fast"></div>
        <div className="absolute bottom-24 right-20 w-20 h-20 bg-emerald-400/20 rounded-xl rotate-45 animate-float-fast delay-300"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-cyan-400/20 rounded-lg -rotate-12 animate-float-fast delay-500"></div>
        <div className="absolute bottom-1/3 right-10 w-14 h-14 bg-white/15 rounded-lg rotate-6 animate-float-fast delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-teal-400/20 rounded-md rotate-90 animate-float-fast delay-200"></div>
        
        {/* Extra Small Decorative Dots */}
        <div className="absolute top-32 right-1/2 w-3 h-3 bg-teal-400/50 rounded-full animate-ping-fast"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-emerald-400/50 rounded-full animate-ping-fast delay-300"></div>
        <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-cyan-400/50 rounded-full animate-ping-fast delay-600"></div>
        
        {/* Additional Floating Shapes */}
        <div className="absolute top-10 right-1/3 w-8 h-8 bg-white/10 rounded-2xl rotate-45 animate-float-fast delay-400"></div>
        <div className="absolute bottom-10 left-1/4 w-10 h-10 bg-teal-400/10 rounded-full animate-float-fast delay-800"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            
            {/* Header */}
            <div className="p-6 text-center border-b border-white/20">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Student Account Activation</h1>
              <p className="text-white/50 text-sm mt-1">Complete your registration to get started</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield size={24} className="text-teal-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Verify Your Identity</h2>
                      <p className="text-white/50 text-sm mt-1">Enter the details provided by your department</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Registration Number Field */}
                      <div className="relative">
                        <IdCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          placeholder="Registration Number"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
                          value={regNo}
                          onChange={(e) => setRegNo(e.target.value)}
                        />
                      </div>

                      {/* CNIC Field */}
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          placeholder="CNIC (without dashes)"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
                          value={cnic}
                          onChange={(e) => setCnic(e.target.value)}
                        />
                      </div>

                      {/* Verify Button */}
                      <motion.button 
                        onClick={verifyStudent} 
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          <>
                            <UserCheck size={18} />
                            Verify & Continue
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserCheck size={24} className="text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Create Your Account</h2>
                      <p className="text-white/50 text-sm mt-1">Set your login credentials for {regNo}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Email Field */}
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="email"
                          placeholder="University Email"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all outline-none"
                          value={creds.email}
                          onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="password"
                          placeholder="Choose Password"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all outline-none"
                          value={creds.password}
                          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                        />
                      </div>

                      {/* Complete Registration Button */}
                      <motion.button 
                        onClick={finalizeRegistration} 
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Activating...
                          </span>
                        ) : (
                          <>
                            <UserCheck size={18} />
                            Complete Registration
                          </>
                        )}
                      </motion.button>

                      {/* Back Button */}
                      <button 
                        onClick={() => setStep(1)} 
                        className="w-full flex items-center justify-center gap-2 text-white/50 text-sm font-medium hover:text-white/80 transition-all py-2"
                      >
                        <ArrowLeft size={16} />
                        Back to verification
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 text-center border-t border-white/20">
              <p className="text-white/40 text-xs">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-teal-400 hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Animations - FASTER SPEEDS */}
      <style jsx>{`
        @keyframes pulse-fast {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(5deg);
          }
          75% {
            transform: translateY(10px) rotate(-5deg);
          }
        }
        
        @keyframes ping-fast {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 3s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        
        .animate-ping-fast {
          animation: ping-fast 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default ClaimAccount;