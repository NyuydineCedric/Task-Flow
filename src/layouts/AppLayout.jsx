import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import TaskModal from "../components/tasks/TaskModal";
import ReminderPopup from "../components/ui/ReminderPopup";
import { notificationService } from "../services/notificationService";
import "./AppLayout.css";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function AppLayout() {
  const { activeModal, tasks, settings, user } = useApp();
  const location = useLocation();
  const settingsRef = useRef(settings);

  // Keep settingsRef always up to date
  // This ensures timers always use the latest settings
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Schedule reminders whenever tasks or user changes
  useEffect(() => {
    if (!user?.email || !tasks?.length) return;

    console.log(`🔄 Syncing reminders for ${user.email}`);
    console.log(`🔊 Sounds enabled: ${settings.sounds}`);
    console.log(`🔔 Notifications enabled: ${settings.notifications}`);

    // Tell backend to schedule email reminders
    const token = localStorage.getItem("tf_token");
    if (token) {
      fetch("http://localhost:4000/api/email/reschedule-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks }),
      })
        .then((r) => r.json())
        .then((d) => console.log("📅 Backend reminders scheduled:", d))
        .catch((err) =>
          console.warn("Backend reschedule failed:", err.message),
        );
    }

    // Pass a getter function so timers always use latest settings
    notificationService.rescheduleAll(tasks, {
      get sounds() {
        return settingsRef.current.sounds;
      },
      get notifications() {
        return settingsRef.current.notifications;
      },
    });
  }, [tasks, user?.email]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-body">
        <Topbar />
        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="page-wrapper"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {(activeModal === "add-task" || activeModal === "edit-task") && (
          <TaskModal />
        )}
      </AnimatePresence>

      <ReminderPopup />
    </div>
  );
}
