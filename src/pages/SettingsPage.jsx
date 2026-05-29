import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Bell, Volume2, Mail, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";

import "./SettingsPage.css";
import logo from "../assets/logo.jpg";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export default function SettingsPage() {
  const { settings, updateSettings, logout } = useApp();
  const navigate = useNavigate();

  function toggle(key) {
    updateSettings({ [key]: !settings[key] });
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
            <div className="about-name">TaskToDo</div>
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
