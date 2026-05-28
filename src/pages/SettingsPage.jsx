import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Moon,
  Bell,
  Volume2,
  Mail,
  Clock,
  Coffee,
  User,
  Calendar,
  Shield,
  Download,
  LogOut,
  Keyboard,
  Sparkles,
  CheckCircle,
  Plus,
  Minus,
  Send,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { notificationService } from "../services/notificationService";
import "./SettingsPage.css";
import logo from "../assets/logo.jpg";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

const SHORTCUTS = [
  ["N", "New task"],
  ["F", "Focus mode"],
  ["S", "Settings"],
  ["/", "Search tasks"],
  ["Esc", "Close modal"],
  ["D", "Dashboard"],
];

export default function SettingsPage() {
  const { settings, updateSettings, user, logout } = useApp();
  const navigate = useNavigate();
  const [testSent, setTestSent] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  function toggle(key) {
    updateSettings({ [key]: !settings[key] });
  }

  async function handleTestEmail() {
    setTestLoading(true);
    try {
      await notificationService.sendTestEmail(user.email);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      console.error("Test email failed:", err);
    } finally {
      setTestLoading(false);
    }
  }

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  return (
    <motion.div
      className="settings-page"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <div className="settings-grid">
        {/* Left column */}
        <div>
          {/* Preferences */}
          <motion.div className="settings-card" variants={item}>
            <h3 className="sc-title">Preferences</h3>
            {[
              {
                key: "theme",
                label: "Dark Mode",
                desc: "Switch to dark theme",
                icon: Moon,
                isTheme: true,
              },
              {
                key: "notifications",
                label: "Browser Notifications",
                desc: "Get notified about reminders and due tasks",
                icon: Bell,
              },
              {
                key: "sounds",
                label: "Notification Sounds",
                desc: "Play sound effects for reminders and completions",
                icon: Volume2,
              },
              {
                key: "weeklyReport",
                label: "Weekly Report",
                desc: "Receive a weekly productivity email summary",
                icon: Mail,
              },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = s.isTheme
                ? settings.theme === "dark"
                : settings[s.key];
              return (
                <div key={s.key} className="setting-row">
                  <div className="setting-info">
                    <span className="setting-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="setting-label">{s.label}</div>
                      <div className="setting-desc">{s.desc}</div>
                    </div>
                  </div>
                  <button
                    className={`toggle-btn ${isActive ? "toggle-btn--on" : ""}`}
                    onClick={() =>
                      s.isTheme
                        ? updateSettings({
                            theme: settings.theme === "dark" ? "light" : "dark",
                          })
                        : toggle(s.key)
                    }
                  />
                </div>
              );
            })}
          </motion.div>

          {/* Focus settings */}
          <motion.div className="settings-card" variants={item}>
            <h3 className="sc-title">Focus Mode</h3>
            <div className="focus-settings-grid">
              {[
                {
                  key: "focusDuration",
                  label: "Focus Duration",
                  icon: Clock,
                  unit: "min",
                  min: 5,
                  max: 90,
                },
                {
                  key: "breakDuration",
                  label: "Break Duration",
                  icon: Coffee,
                  unit: "min",
                  min: 1,
                  max: 30,
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className="focus-setting-item">
                    <div className="fs-label-wrap">
                      <Icon size={14} />
                      <label className="fs-label">{f.label}</label>
                    </div>
                    <div className="fs-input-wrap">
                      <button
                        className="fs-stepper"
                        onClick={() =>
                          updateSettings({
                            [f.key]: Math.max(f.min, settings[f.key] - 1),
                          })
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span className="fs-value">{settings[f.key]}</span>
                      <button
                        className="fs-stepper"
                        onClick={() =>
                          updateSettings({
                            [f.key]: Math.min(f.max, settings[f.key] + 1),
                          })
                        }
                      >
                        <Plus size={12} />
                      </button>
                      <span className="fs-unit">{f.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div>
          {/* Account */}
          <motion.div className="settings-card" variants={item}>
            {/* Email notifications test row */}
            <div className="account-row">
              <button className="signout-btn" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* About */}
          <motion.div className="settings-card settings-about" variants={item}>
            <div className="about-logo">
              <img
                src={logo}
                alt="logo"
                style={{ width: "100px", borderRadius: "50%" }}
              />
            </div>
            <div className="about-name">TaskFlow</div>
            <div className="about-version">Version 1.0.0 · Pro</div>
            <p className="about-desc">
              Your premium productivity companion. Built with React, Framer
              Motion, and lots of dedication.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
