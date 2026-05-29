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

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
  const tasksRef = useRef(tasks);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Reschedule frontend timers whenever tasks change
  useEffect(() => {
    if (!user?.email || !tasks?.length) return;
    notificationService.rescheduleAll(tasks, {
      get sounds() {
        return settingsRef.current.sounds;
      },
      get notifications() {
        return settingsRef.current.notifications;
      },
    });
  }, [tasks, user?.email]);

  // Sync backend reminders only on login
  useEffect(() => {
    if (!user?.email) return;
    const timer = setTimeout(() => {
      const currentTasks = tasksRef.current;
      if (!currentTasks?.length) return;
      const token = localStorage.getItem("tf_token");
      if (!token) return;
      fetch(`${API}/email/reschedule-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks: currentTasks }),
      })
        .then((r) => r.json())
        .then((d) => console.log("📅 Backend reminders scheduled:", d))
        .catch((err) =>
          console.warn("Backend reschedule failed:", err.message),
        );
    }, 500);
    return () => clearTimeout(timer);
  }, [user?.email]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-body">
        <Topbar />
        <main className="app-main">
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
