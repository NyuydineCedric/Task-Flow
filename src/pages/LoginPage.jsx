import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";
import bgImage from "../assets/bgImage.png";
import logo from "../assets/logo.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = login({ email: form.email, password: form.password });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <button className="login-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back to home
        </button>

        <div className="login-brand">
          <img
            src={logo}
            alt="logo"
            style={{ width: "40px", borderRadius: "50%" }}
          />
          <span className="login-brand-name">TaskFlow</span>
        </div>
        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="login-field">
            <label>Email address</label>
            <div className="login-input-wrap">
              <Mail size={15} className="login-input-icon" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="login-input"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-field-row">
              <label>Password</label>
              <Link to="/forgot" className="login-forgot">
                Forgot password?
              </Link>
            </div>
            <div className="login-input-wrap">
              <Lock size={15} className="login-input-icon" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Enter your password"
                className="login-input"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPass((s) => !s)}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input type="checkbox" defaultChecked /> Remember me for 30 days
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "Sign in to TaskFlow"
            )}
          </button>
        </form>

        <p className="login-switch">
          Don't have an account? <Link to="/signup">Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}
