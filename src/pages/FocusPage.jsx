import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Zap,
  Lightbulb,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import "./FocusPage.css";
import smile from "../assets/smile.jpg";

export default function FocusPage() {
  const { tasks, settings } = useApp();
  const focusDur = (settings.focusDuration || 25) * 60;
  const breakDur = (settings.breakDuration || 5) * 60;

  const [mode, setMode] = useState("work");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(focusDur);
  const [sessions, setSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);

  const duration = mode === "work" ? focusDur : breakDur;
  const pct = ((duration - remaining) / duration) * 100;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") {
              setSessions((s) => s + 1);
              setTotalTime((t) => t + focusDur);
              setMode("break");
              return breakDur;
            } else {
              setMode("work");
              return focusDur;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, focusDur, breakDur]);

  function toggleRun() {
    setRunning((r) => !r);
  }
  function reset() {
    setRunning(false);
    setMode("work");
    setRemaining(focusDur);
  }
  function skip() {
    setRunning(false);
    if (mode === "work") {
      setMode("break");
      setRemaining(breakDur);
    } else {
      setMode("work");
      setRemaining(focusDur);
    }
  }

  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 5);
  const PRIO_C = { high: "#EF4444", medium: "#F59E0B", low: "#16C47F" };

  // SVG circle parameters
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const ringColor = mode === "work" ? "var(--green)" : "var(--gold)";

  return (
    <div className="focus-page">
      <div className="focus-container">
        {/* Timer Card */}
        <motion.div
          className="focus-timer-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="focus-mode-switch">
            <button
              className={`focus-mode-btn ${mode === "work" ? "active" : ""}`}
              onClick={() => {
                setRunning(false);
                setMode("work");
                setRemaining(focusDur);
              }}
            >
              <Zap size={16} />
              <span>Focus</span>
            </button>
            <button
              className={`focus-mode-btn ${mode === "break" ? "active" : ""}`}
              onClick={() => {
                setRunning(false);
                setMode("break");
                setRemaining(breakDur);
              }}
            >
              <Coffee size={16} />
              <span>Break</span>
            </button>
          </div>

          <div className="focus-timer-ring">
            <svg viewBox="0 0 200 200" className="focus-ring-svg">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="focus-timer-text">
              <div className="focus-time-digits">
                {mm}:{ss}
              </div>
              <div className="focus-mode-label">
                {mode === "work" ? "focus session" : "break time"}
              </div>
            </div>
          </div>

          <div className="focus-actions">
            <button className="focus-action-btn" onClick={reset} title="Reset">
              <RotateCcw size={20} />
            </button>
            <button className="focus-play-pause" onClick={toggleRun}>
              {running ? (
                <Pause size={28} />
              ) : (
                <Play size={28} style={{ marginLeft: 2 }} />
              )}
            </button>
            <button className="focus-action-btn" onClick={skip} title="Skip">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="focus-stats">
            <div className="focus-stat">
              <span className="focus-stat-value">{sessions}</span>
              <span className="focus-stat-label">Sessions</span>
            </div>
            <div className="focus-stat-divider" />
            <div className="focus-stat">
              <span className="focus-stat-value">
                {Math.floor(totalTime / 60)}m
              </span>
              <span className="focus-stat-label">Focus time</span>
            </div>
            <div className="focus-stat-divider" />
            <div className="focus-stat">
              <span className="focus-stat-value">
                {settings.focusDuration}m
              </span>
              <span className="focus-stat-label">Duration</span>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="focus-sidebar">
          <motion.div
            className="focus-tasks-widget"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="widget-title">Priority Tasks</h3>
            {pendingTasks.length ? (
              <div className="focus-task-list">
                {pendingTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    className="focus-task-item"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span
                      className="task-priority-dot"
                      style={{ background: PRIO_C[task.priority] }}
                    />
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-category">{task.category}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="focus-empty-state">No pending tasks – well done!</p>
            )}
          </motion.div>

          <motion.div
            className="focus-tips-widget"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="widget-header">
              <Lightbulb size={16} />
              <h3 className="widget-title">Focus Tips</h3>
            </div>
            <ul className="focus-tips-list">
              <li>Put your phone face down</li>
              <li>Close unnecessary tabs</li>
              <li>Drink a glass of water</li>
              <li>Take deep breaths</li>
            </ul>
          </motion.div>
          <img
            src={smile}
            alt="smile"
            style={{ width: "200px", borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
