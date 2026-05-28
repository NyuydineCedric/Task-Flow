import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Calendar, AlertTriangle } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { useApp } from "../../context/AppContext";
import "./ReminderPopup.css";

const PRIO_META = {
  high: { color: "#EF4444", bg: "#fee2e2", icon: AlertTriangle },
  medium: { color: "#F59E0B", bg: "#fef3c7", icon: Bell },
  low: { color: "#16C47F", bg: "#dcfce7", icon: Bell },
};

export default function ReminderPopup() {
  const { settings } = useApp();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    function handleReminder(e) {
      const { task } = e.detail;
      const id = `${task.id}_${Date.now()}`;
      setReminders((prev) => [...prev, { ...task, _popupId: id }]);

      // Auto-dismiss after 12 seconds
      setTimeout(() => dismiss(id), 12000);
    }

    window.addEventListener("taskflow:reminder", handleReminder);
    return () =>
      window.removeEventListener("taskflow:reminder", handleReminder);
  }, []);

  function dismiss(popupId) {
    setReminders((prev) => prev.filter((r) => r._popupId !== popupId));
  }

  function snooze(task, popupId) {
    dismiss(popupId);
    // Re-fire in 5 minutes
    setTimeout(
      () => {
        notificationService.fireReminder(task, settings);
      },
      5 * 60 * 1000,
    );
  }

  return createPortal(
    <div className="reminder-stack">
      <AnimatePresence>
        {reminders.map((task) => {
          const meta = PRIO_META[task.priority] || PRIO_META.medium;
          const Icon = meta.icon;

          return (
            <motion.div
              key={task._popupId}
              className="reminder-popup"
              initial={{ opacity: 0, x: 340, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 340, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              {/* Priority accent bar */}
              <div
                className="reminder-accent"
                style={{ background: meta.color }}
              />

              <div className="reminder-body">
                <div className="reminder-header">
                  <div
                    className="reminder-icon-wrap"
                    style={{ background: meta.bg }}
                  >
                    <Icon size={16} style={{ color: meta.color }} />
                  </div>
                  <div className="reminder-titles">
                    <div className="reminder-label">
                      ⏰ Task Reminder
                      {task._reminderLabel && (
                        <span className="reminder-lead">
                          {" "}
                          · Due {task._reminderLabel}
                        </span>
                      )}
                    </div>
                    <div className="reminder-task-title">{task.title}</div>
                  </div>
                  <button
                    className="reminder-close"
                    onClick={() => dismiss(task._popupId)}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="reminder-meta">
                  <span
                    className="reminder-cat-badge"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {task.category}
                  </span>
                  {task.due && (
                    <span className="reminder-due">
                      <Calendar size={11} />
                      {new Date(task.due).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <span className="reminder-prio" style={{ color: meta.color }}>
                    {task.priority} priority
                  </span>
                </div>

                {task.description && (
                  <p className="reminder-desc">{task.description}</p>
                )}

                <div className="reminder-actions">
                  <button
                    className="reminder-btn reminder-btn--snooze"
                    onClick={() => snooze(task, task._popupId)}
                  >
                    😴 Snooze 5 min
                  </button>
                  <button
                    className="reminder-btn reminder-btn--dismiss"
                    onClick={() => dismiss(task._popupId)}
                  >
                    Dismiss
                  </button>
                </div>

                {/* Progress bar (auto-dismiss countdown) */}
                <motion.div
                  className="reminder-progress"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
