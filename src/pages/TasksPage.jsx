import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, ClipboardList } from "lucide-react";
import { useApp } from "../context/AppContext";
import TaskCard from "../components/tasks/TaskCard";
import "./TasksPage.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "today", label: "Today" },
  { key: "high", label: "High Priority" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Done" },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}
function isOverdue(d, done) {
  if (!d || done) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

export default function TasksPage() {
  const { tasks, openModal, searchQuery, setSearch } = useApp();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("priority");

  const today = getToday();
  let filtered = tasks;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q),
    );
  }

  switch (filter) {
    case "active":
      filtered = filtered.filter((t) => !t.done);
      break;
    case "today":
      filtered = filtered.filter((t) => t.due && t.due.startsWith(today));
      break;
    case "high":
      filtered = filtered.filter((t) => t.priority === "high" && !t.done);
      break;
    case "overdue":
      filtered = filtered.filter((t) => isOverdue(t.due, t.done));
      break;
    case "completed":
      filtered = filtered.filter((t) => t.done);
      break;
  }

  const pOrder = { high: 0, medium: 1, low: 2 };
  filtered = [...filtered].sort((a, b) => {
    if (sort === "priority") return pOrder[a.priority] - pOrder[b.priority];
    if (sort === "due") {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due) - new Date(b.due);
    }
    if (sort === "name") return a.title.localeCompare(b.title);
    return b.createdAt - a.createdAt;
  });

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.done).length,
    today: tasks.filter((t) => t.due && t.due.startsWith(today)).length,
    high: tasks.filter((t) => t.priority === "high" && !t.done).length,
    overdue: tasks.filter((t) => isOverdue(t.due, t.done)).length,
    completed: tasks.filter((t) => t.done).length,
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="tasks-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className="filter-count">{counts[f.key]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="tasks-controls">
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="priority">Priority</option>
            <option value="due">Due date</option>
            <option value="created">Newest</option>
            <option value="name">Name</option>
          </select>
          <button
            className="tasks-add-btn"
            onClick={() => openModal("add-task")}
          >
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      <div className="tasks-body">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              className="tasks-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="tasks-empty-icon">
                <ClipboardList size={48} />
              </div>
              <h3>No tasks found</h3>
              <p>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : filter === "completed"
                    ? "Complete some tasks to see them here."
                    : "No tasks in this category."}
              </p>
              <button
                className="tasks-empty-btn"
                onClick={() => openModal("add-task")}
              >
                <Plus size={14} /> Add your first task
              </button>
            </motion.div>
          ) : (
            <div className="task-list">
              {filtered.map((t, i) => (
                <TaskCard key={t.id} task={t} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
