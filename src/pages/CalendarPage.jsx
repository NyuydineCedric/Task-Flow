import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import TaskCard from "../components/tasks/TaskCard";
import "./CalendarPage.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const { tasks } = useApp();
  const [date, setDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const taskMap = {};
  tasks.forEach((t) => {
    if (t.due) {
      const key = t.due.split("T")[0];
      if (!taskMap[key]) taskMap[key] = [];
      taskMap[key].push(t);
    }
  });

  function prevMonth() {
    setDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const dayKey = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedTasks = dayKey ? taskMap[dayKey] || [] : [];

  const upcoming = tasks
    .filter((t) => !t.done && t.due)
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  return (
    <div className="calendar-page">
      <div className="cal-layout">
        <div className="cal-main">
          {/* Header */}
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <h2 className="cal-month-title">
              {MONTHS[month]} {year}
            </h2>
            <button className="cal-nav-btn" onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day labels */}
          <div className="cal-days-head">
            {DAYS.map((d) => (
              <div key={d} className="cal-day-label">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="cal-grid">
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`e${i}`} className="cal-cell cal-cell--empty" />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const dayTasks = taskMap[key] || [];
              const isToday =
                d === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = d === selectedDay;

              return (
                <motion.div
                  key={d}
                  className={`cal-cell ${isToday ? "cal-cell--today" : ""} ${isSelected ? "cal-cell--selected" : ""} ${dayTasks.length ? "cal-cell--has-tasks" : ""}`}
                  onClick={() => setSelectedDay(d === selectedDay ? null : d)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="cal-cell-num">{d}</span>
                  {dayTasks.length > 0 && (
                    <div className="cal-cell-dots">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="cal-dot"
                          style={{
                            background:
                              t.priority === "high"
                                ? "var(--red)"
                                : t.priority === "medium"
                                  ? "var(--amber)"
                                  : "var(--green)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Selected day tasks */}
          {selectedDay && (
            <motion.div
              className="cal-selected-tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="cal-selected-title">
                {MONTHS[month]} {selectedDay} — {selectedTasks.length} task
                {selectedTasks.length !== 1 ? "s" : ""}
              </h3>
              {selectedTasks.length ? (
                selectedTasks.map((t, i) => (
                  <TaskCard key={t.id} task={t} index={i} />
                ))
              ) : (
                <p className="cal-no-tasks">No tasks scheduled for this day.</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="cal-sidebar">
          <div className="cal-sidebar-card">
            <h3 className="cal-sidebar-title">Upcoming Tasks</h3>
            {upcoming.length ? (
              <div className="upcoming-list">
                {upcoming.map((t) => {
                  const d = new Date(t.due);
                  return (
                    <div key={t.id} className="upcoming-item">
                      <div className="upcoming-date">
                        <span className="upcoming-day">{d.getDate()}</span>
                        <span className="upcoming-month">
                          {MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                      </div>
                      <div className="upcoming-info">
                        <div className="upcoming-title">{t.title}</div>
                        <div className="upcoming-cat">{t.category}</div>
                      </div>
                      <div
                        className="upcoming-prio"
                        style={{
                          background:
                            t.priority === "high"
                              ? "var(--red-light)"
                              : t.priority === "medium"
                                ? "var(--amber-light)"
                                : "var(--green-light)",
                          color:
                            t.priority === "high"
                              ? "var(--red)"
                              : t.priority === "medium"
                                ? "var(--amber-dark)"
                                : "var(--green-dark)",
                        }}
                      >
                        {t.priority}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text3)", fontSize: 13 }}>
                No upcoming tasks! 🎉
              </p>
            )}
          </div>

          <div className="cal-sidebar-card" style={{ marginTop: 14 }}>
            <h3 className="cal-sidebar-title">Legend</h3>
            {[
              ["var(--red)", "High priority"],
              ["var(--amber)", "Medium priority"],
              ["var(--green)", "Low priority"],
            ].map(([c, l]) => (
              <div key={l} className="legend-item">
                <span className="legend-dot" style={{ background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
