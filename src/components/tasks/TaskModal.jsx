import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, AlignLeft, Flag, Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./TaskModal.css";

const CATS = ["Work", "Personal", "Study", "Health", "Finance"];
const PRIOS = [
  { v: "high", label: "High", color: "#EF4444" },
  { v: "medium", label: "Medium", color: "#F59E0B" },
  { v: "low", label: "Low", color: "#16C47F" },
];

// Convert local date+time string to UTC ISO string
// This treats the input as Cameroon local time (WAT = UTC+1)
function toUTCIso(dateStr, timeStr) {
  if (!dateStr || !timeStr) return dateStr || "";
  // Build a local datetime string
  const localStr = `${dateStr}T${timeStr}:00`;
  // new Date() parses this as LOCAL time of the browser
  // Since user is in Cameroon and browser is also in Cameroon, this is correct
  const d = new Date(localStr);
  return d.toISOString(); // returns UTC ISO
}

// Extract date part in local timezone for display
function toLocalDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Extract time part in local timezone for display
function toLocalTime(isoStr) {
  if (!isoStr || !isoStr.includes("T")) return "";
  const d = new Date(isoStr);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function TaskModal() {
  const { closeModal, addTask, updateTask, editingTask, activeModal } =
    useApp();
  const editing = activeModal === "edit-task" && editingTask;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Work",
    priority: "medium",
    due: "",
    dueTime: "",
    tags: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        category: editingTask.category || "Work",
        priority: editingTask.priority || "medium",
        due: toLocalDate(editingTask.due),
        dueTime: toLocalTime(editingTask.due),
        tags: (editingTask.tags || []).join(", "),
      });
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setForm({
        title: "",
        description: "",
        category: "Work",
        priority: "medium",
        due: `${yyyy}-${mm}-${dd}`,
        dueTime: "",
        tags: "",
      });
    }
  }, [editing, editingTask]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    // Convert local Cameroon time to UTC ISO
    const dueISO = form.dueTime ? toUTCIso(form.due, form.dueTime) : form.due;

    console.log(`📅 Task due time:`);
    console.log(`   Local (Cameroon): ${form.due} ${form.dueTime}`);
    console.log(`   UTC ISO sent:     ${dueISO}`);

    const taskData = {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      due: dueISO,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    if (editing) {
      updateTask({ ...editingTask, ...taskData });
    } else {
      addTask(taskData);
    }
    closeModal();
  }

  const modal = (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      >
        <motion.div
          className="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="modal-title">
              {editing ? "Edit Task" : "New Task"}
            </h2>
            <button className="modal-close" onClick={closeModal}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {/* Title */}
            <div className="mf-group">
              <label className="mf-label">
                Task Title <span className="mf-required">*</span>
              </label>
              <input
                className={`mf-input ${error ? "mf-input--error" : ""}`}
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  setError("");
                }}
                placeholder="What needs to be done?"
                autoFocus
              />
              {error && <span className="mf-error">{error}</span>}
            </div>

            {/* Description */}
            <div className="mf-group">
              <label className="mf-label">
                <AlignLeft size={12} /> Description
              </label>
              <textarea
                className="mf-input mf-textarea"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add more detail..."
              />
            </div>

            {/* Priority */}
            <div className="mf-group">
              <label className="mf-label">
                <Flag size={12} /> Priority
              </label>
              <div className="mf-prio-grid">
                {PRIOS.map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    className="mf-prio-btn"
                    style={
                      form.priority === p.v
                        ? {
                            borderColor: p.color,
                            background: p.color + "18",
                            color: p.color,
                          }
                        : {}
                    }
                    onClick={() => set("priority", p.v)}
                  >
                    <span
                      className="mf-prio-dot"
                      style={{ background: p.color }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category + Tags */}
            <div className="mf-row">
              <div className="mf-group">
                <label className="mf-label">
                  <Tag size={12} /> Category
                </label>
                <select
                  className="mf-input mf-select"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mf-group">
                <label className="mf-label">
                  <Tag size={12} /> Tags
                </label>
                <input
                  className="mf-input"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="design, urgent..."
                />
              </div>
            </div>

            {/* Due Date + Due Time */}
            <div className="mf-row">
              <div className="mf-group">
                <label className="mf-label">
                  <Calendar size={12} /> Due Date
                </label>
                <input
                  type="date"
                  className="mf-input"
                  value={form.due}
                  onChange={(e) => set("due", e.target.value)}
                />
              </div>
              <div className="mf-group">
                <label className="mf-label">
                  <Clock size={12} /> Due Time
                  <span
                    style={{
                      color: "var(--text3)",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    &nbsp;(Cameroon time)
                  </span>
                </label>
                <input
                  type="time"
                  className="mf-input"
                  value={form.dueTime}
                  onChange={(e) => set("dueTime", e.target.value)}
                />
              </div>
            </div>

            {/* Reminder info banner */}
            {form.dueTime && (
              <div className="mf-reminder-info">
                🔔 You'll get reminders at 30 min, 10 min before, and exactly at{" "}
                <strong>{form.dueTime}</strong> Cameroon time
              </div>
            )}

            {/* Actions */}
            <div className="mf-actions">
              <button
                type="button"
                className="mf-btn mf-btn--ghost"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button type="submit" className="mf-btn mf-btn--primary">
                {editing ? "Save Changes" : "+ Add Task"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
