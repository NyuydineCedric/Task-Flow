import { motion } from "framer-motion";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./TaskCard.css";

const PRIO_COLORS = { high: "#EF4444", medium: "#F59E0B", low: "#16C47F" };
const CAT_STYLES = {
  Work: { bg: "#dbeafe", color: "#1d4ed8" },
  Personal: { bg: "#dcfce7", color: "#15803d" },
  Study: { bg: "#ede9fe", color: "#6d28d9" },
  Health: { bg: "#fee2e2", color: "#b91c1c" },
  Finance: { bg: "#fef3c7", color: "#92400e" },
};

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const diff = Math.round((dt - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(d, done) {
  if (!d || done) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, index = 0 }) {
  const { toggleTask, deleteTask, openModal } = useApp();
  const overdue = isOverdue(task.due, task.done);
  const catStyle = CAT_STYLES[task.category] || {};

  return (
    <motion.div
      className={`task-card ${task.done ? "task-card--done" : ""}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.12 } }}
      layout
    >
      <button
        className={`task-check ${task.done ? "task-check--done" : ""}`}
        onClick={() => toggleTask(task.id)}
      >
        {task.done && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="task-body">
        <p className={`task-title ${task.done ? "task-title--done" : ""}`}>
          {task.title}
        </p>
        {task.description && !task.done && (
          <p className="task-desc">{task.description}</p>
        )}
        <div className="task-meta">
          <span
            className="task-prio-dot"
            style={{ background: PRIO_COLORS[task.priority] }}
            title={task.priority + " priority"}
          />
          {task.category && (
            <span
              className="task-cat-badge"
              style={{ background: catStyle.bg, color: catStyle.color }}
            >
              {task.category}
            </span>
          )}
          {task.due && (
            <span className={`task-due ${overdue ? "task-due--overdue" : ""}`}>
              <Calendar size={11} /> {formatDate(task.due)}
              {overdue ? " · Overdue" : ""}
            </span>
          )}
          {(task.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="task-tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="task-action-btn"
          onClick={() => openModal("edit-task", task)}
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          className="task-action-btn task-action-btn--delete"
          onClick={() => deleteTask(task.id)}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}
