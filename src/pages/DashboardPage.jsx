import { useEffect, Component } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import TaskCard from "../components/tasks/TaskCard";
import "./DashboardPage.css";

// ✅ Error boundary to catch silent render crashes
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: "red" }}>
          <h2>Dashboard crashed:</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function isOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

function DashboardContent() {
  const { tasks, user, openModal, loadTasks } = useApp();
  const navigate = useNavigate();

  const tasksList = Array.isArray(tasks) ? tasks : [];

  useEffect(() => {
    loadTasks?.();
  }, [loadTasks]);

  const done = tasksList.filter((t) => t.done).length;
  const pending = tasksList.filter((t) => !t.done).length;
  const overdue = tasksList.filter((t) => !t.done && isOverdue(t.due)).length;
  const score = tasksList.length
    ? Math.round((done / tasksList.length) * 100)
    : 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const recentTasks = tasksList.slice(0, 5);

  const categories = ["Work", "Personal", "Study", "Health", "Finance"].map(
    (cat) => {
      const ct = tasksList.filter((t) => t.category === cat);
      const cd = ct.filter((t) => t.done).length;
      return {
        cat,
        total: ct.length,
        done: cd,
        pct: ct.length ? Math.round((cd / ct.length) * 100) : 0,
      };
    },
  );

  const weekBars = [
    { d: "M", v: 4 },
    { d: "T", v: 7 },
    { d: "W", v: 5 },
    { d: "T", v: 9 },
    { d: "F", v: 6 },
    { d: "S", v: 3 },
    { d: "S", v: 2 },
  ];
  const maxV = Math.max(...weekBars.map((b) => b.v));

  return (
    <motion.div
      className="dashboard"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* Welcome */}
      <motion.div className="dash-welcome" variants={item}>
        <div>
          <h1 className="dash-greeting">
            {greeting()}, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="dash-date">
            {today} · {pending} task{pending !== 1 ? "s" : ""} pending
            {overdue > 0 ? ` · ${overdue} overdue` : ""}
          </p>
        </div>
        <button className="dash-add-btn" onClick={() => openModal("add-task")}>
          <Plus size={15} /> New Task
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div className="dash-stats" variants={stagger}>
        {[
          {
            icon: CheckSquare,
            label: "Completed",
            value: done,
            trend: "+23%",
            color: "var(--green)",
            bg: "#dcfce7",
          },
          {
            icon: Clock,
            label: "Pending",
            value: pending,
            trend: `${overdue} overdue`,
            color: "var(--blue)",
            bg: "#dbeafe",
          },
          {
            icon: TrendingUp,
            label: "Score",
            value: `${score}%`,
            trend: "+8% month",
            color: "var(--purple)",
            bg: "#ede9fe",
          },
        ].map((s) => (
          <motion.div key={s.label} className="stat-card" variants={item}>
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
            >
              <s.icon size={20} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend">{s.trend}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main 2-col */}
      <div className="dash-grid">
        {/* Recent Tasks */}
        <motion.div variants={item}>
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <button className="section-link" onClick={() => navigate("/tasks")}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="task-list">
            {recentTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div>
          {/* Progress by category */}
          <motion.div
            className="dash-card"
            variants={item}
            style={{ marginBottom: 16 }}
          >
            <h3 className="dash-card-title">Category Progress</h3>
            {categories
              .filter((c) => c.total > 0)
              .map((c) => (
                <div key={c.cat} className="cat-row">
                  <div className="cat-row-top">
                    <span className="cat-name">{c.cat}</span>
                    <span className="cat-pct">
                      {c.done}/{c.total} · {c.pct}%
                    </span>
                  </div>
                  <div className="prog-track">
                    <motion.div
                      className="prog-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
          </motion.div>

          {/* Mini chart */}
          <motion.div className="dash-card" variants={item}>
            <h3 className="dash-card-title">This Week</h3>
            <div className="mini-chart">
              {weekBars.map((b, i) => (
                <div key={i} className="mini-bar-wrap">
                  <span className="mini-bar-val">{b.v}</span>
                  <motion.div
                    className="mini-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${(b.v / maxV) * 80}px` }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.06,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  />
                  <span className="mini-bar-day">{b.d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
