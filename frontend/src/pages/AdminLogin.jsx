import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, { password });
      localStorage.setItem("az-admin-token", res.data.token);
      onLogin();
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="text-2xl font-poppins font-black gold-text tracking-widest mb-2">
            AZ DISTRIBUTION
          </div>
          <p className="text-gray-500 text-sm font-inter tracking-wider">
            Admin Panel
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        {/* Login Card */}
        <div className="border border-[#D4AF37]/20 bg-[#18181B] p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-3">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-3 text-white font-inter placeholder:text-gray-600 transition-colors pr-10"
                  data-testid="admin-password-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 font-inter" data-testid="admin-login-error">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="admin-login-btn"
            >
              <Lock size={15} />
              {loading ? "Logging in..." : "Login to Admin"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#D4AF37] transition-colors font-inter"
          >
            <ArrowLeft size={12} />
            Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
