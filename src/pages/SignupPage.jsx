import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import "./SignupPage.css";
import bgImage from "../assets/bgImage.png";
import logo from "../assets/logo.jpg";

function passwordStrength(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#EF4444", "#F59E0B", "#3B82F6", "#16C47F"];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, login } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.email) {
      setError("Email is required");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const result = await signup({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto login after signup
    login({ email: form.email.trim().toLowerCase(), password: form.password });
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <motion.div
        className="signup-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <button className="signup-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back to home
        </button>

        <div className="signup-brand">
          <img
            src={logo}
            alt="logo"
            style={{ width: "40px", borderRadius: "50%" }}
          />
          <span className="signup-brand-name">TaskFlow</span>
        </div>
        <h2 className="signup-title">Create your account</h2>
        <p className="signup-subtitle">Free forever · No credit card needed</p>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="signup-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="signup-field">
            <label>Full Name</label>
            <div className="signup-input-wrap">
              <User size={15} className="signup-input-icon" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="enter full name"
                className="signup-input"
                autoFocus
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Email address</label>
            <div className="signup-input-wrap">
              <Mail size={15} className="signup-input-icon" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="signup-input"
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Password</label>
            <div className="signup-input-wrap">
              <Lock size={15} className="signup-input-icon" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="At least 6 characters"
                className="signup-input"
              />
              <button
                type="button"
                className="signup-eye"
                onClick={() => setShowPass((s) => !s)}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-bar"
                      style={{
                        background:
                          i <= strength ? STRENGTH_COLORS[strength] : "#334155",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    color: STRENGTH_COLORS[strength],
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="signup-field">
            <label>Confirm Password</label>
            <div className="signup-input-wrap">
              <Lock size={15} className="signup-input-icon" />
              <input
                type={showPass ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="Repeat your password"
                className="signup-input"
              />
              {form.confirm && (
                <span className="signup-confirm-icon">
                  {form.password === form.confirm ? (
                    <CheckCircle size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}
                </span>
              )}
            </div>
          </div>

          <label className="signup-checkbox">
            <input type="checkbox" required /> I agree to the{" "}
            <a href="#" style={{ color: "#f97316" }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" style={{ color: "#f97316" }}>
              Privacy Policy
            </a>
          </label>

          <button type="submit" className="signup-submit" disabled={loading}>
            {loading ? <span className="signup-spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="signup-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
