import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Timer,
  User,
  Settings,
  ChevronLeft,
  Flame,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./Sidebar.css";
import logo from "../../assets/logo.jpg";

const NAV = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks", badge: true },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/focus", icon: Timer, label: "Focus Mode" },
];
const BOTTOM_NAV = [
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, tasks, user } = useApp();
  const pending = tasks.filter((t) => !t.done).length;
  const c = sidebarCollapsed;

  return (
    <motion.aside
      className={`sidebar ${c ? "sidebar--collapsed" : ""}`}
      animate={{ width: c ? 68 : 248 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="sb-logo">
        <div className="sb-logo-icon">
          <img
            src={logo}
            alt="logo"
            style={{ width: "40px", borderRadius: "50%" }}
          />
        </div>
        <AnimatePresence>
          {!c && (
            <motion.span
              className="sb-logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              TaskFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button className="sb-toggle" onClick={toggleSidebar}>
        <motion.span
          animate={{ rotate: c ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={13} />
        </motion.span>
      </button>

      <nav className="sb-nav">
        {!c && <span className="sb-section-label">Workspace</span>}
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sb-item ${isActive ? "sb-item--active" : ""}`
            }
          >
            <span className="sb-icon">
              <item.icon size={18} />
            </span>
            <AnimatePresence>
              {!c && (
                <motion.span
                  className="sb-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge && pending > 0 && !c && (
              <motion.span
                className="sb-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {pending}
              </motion.span>
            )}
            {item.badge && pending > 0 && c && (
              <span className="sb-badge-dot" />
            )}
          </NavLink>
        ))}
        {!c && (
          <span className="sb-section-label" style={{ marginTop: 8 }}>
            Account
          </span>
        )}
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sb-item ${isActive ? "sb-item--active" : ""}`
            }
          >
            <span className="sb-icon">
              <item.icon size={18} />
            </span>
            <AnimatePresence>
              {!c && (
                <motion.span
                  className="sb-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">{user.initials}</div>
          <AnimatePresence>
            {!c && (
              <motion.div
                className="sb-user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="sb-user-name">{user.name}</span>
                <span className="sb-user-meta">
                  <Flame size={10} /> {user.streak}d ·{" "}
                  {user.xp.toLocaleString()} XP
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
