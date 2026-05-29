import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import "./LandingPage.css";
import bgImage from "../assets/bgImage.png";
import logo from "../assets/logo.jpg";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="landing-hero">
        {/* Navigation bar with Login / Sign Up buttons */}
        <div className="landing-nav">
          <div className="landing-brand">
            <img
              src={logo}
              alt="logo"
              style={{ width: "50px", borderRadius: "50%" }}
            />
            <span className="brand-name">TaskToDo</span>
          </div>
          <div className="landing-actions-buttons">
            <button
              className="landing-btn landing-btn-outline"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
            <button
              className="landing-btn landing-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Sign up free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <motion.div
          className="landing-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="landing-headline">
            Your productivity,
            <br />
            <span className="highlight">supercharged.</span>
          </h1>
          <p className="landing-subhead">
            Manage tasks, track progress, stay focused — all in one beautiful
            app. Join thousands of teams who work smarter with TaskFlow.
          </p>

          {/* CTA Buttons Group */}
          <div className="landing-cta-group">
            <button
              className="landing-cta-primary"
              onClick={() => navigate("/login")}
            >
              Get started
              <ArrowRight size={18} />
            </button>
            <button
              className="landing-cta-secondary"
              onClick={() => navigate("/signup")}
            >
              Create free account
            </button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="landing-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { value: "50K+", label: "Active users" },
            { value: "2M+", label: "Tasks completed" },
            { value: "4.9★", label: "App rating" },
          ].map((stat) => (
            <div key={stat.label} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="landing-features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        ></motion.div>
      </div>

      {/* Mobile floating action buttons */}
      <div className="landing-mobile-actions">
        <button
          className="mobile-btn mobile-login"
          onClick={() => navigate("/login")}
        >
          Log in
        </button>
        <button
          className="mobile-btn mobile-signup"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
