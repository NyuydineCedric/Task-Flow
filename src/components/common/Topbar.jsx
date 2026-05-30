import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Plus, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import EmailLog from "../ui/EmailLog";
import { notificationService } from "../../services/notificationService";
import logo from "../../assets/logo.jpg";
import "./Topbar.css";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/tasks": "My Tasks",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/focus": "Focus Mode",
  "/profile": "Profile",
  "/settings": "Settings",
};

const NOTIFS = [
  {
    id: "n1",
    type: "success",
    emoji: "✅",
    title: "Task completed: Design Review",
    time: "2 min ago",
    read: false,
  },
];

export default function Topbar() {
  const { searchQuery, setSearch, openModal } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [emailLogOpen, setEmailLogOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFS);
  const location = useLocation();
  const notifRef = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;
  const title = PAGE_TITLES[location.pathname] || "TaskFlow";

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function markAllRead() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-search">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearch("")}>
            <X size={13} />
          </button>
        )}
      </div>

      <div className="topbar-actions">
        {/* Bell notifications */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            className="tb-icon-btn"
            onClick={async () => {
              // Request notification permission from a user gesture (bell click)
              try {
                if (!notificationService.permissionGranted) {
                  await notificationService.requestPermission();
                }
              } catch (e) {
                console.warn("Permission request failed", e);
              }
              setNotifOpen(!notifOpen);
            }}
            title="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && <span className="notif-dot">{unread}</span>}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className="notif-panel"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <div className="notif-header">
                  <span className="notif-header-title">Notifications</span>
                  <button className="notif-mark-read" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((x) =>
                          x.id === n.id ? { ...x, read: true } : x,
                        ),
                      )
                    }
                  >
                    <span className="notif-emoji">{n.emoji}</span>
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                    {!n.read && <span className="notif-unread-dot" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New task */}
        <button className="tb-add-btn" onClick={() => openModal("add-task")}>
          <Plus size={16} /> New Task
        </button>

        <div className="tb-avatar">
          <img
            src={logo}
            alt="logo"
            style={{ width: "35px", borderRadius: "50%" }}
          />
        </div>
      </div>

      {/* Email log slide-over */}
      <EmailLog isOpen={emailLogOpen} onClose={() => setEmailLogOpen(false)} />
    </header>
  );
}
