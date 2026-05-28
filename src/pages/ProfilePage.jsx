import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Flame,
  Zap,
  Clock,
  Sun,
  Crown,
  Trophy,
  Moon,
  CheckCircle,
  PlusCircle,
  Calendar,
  TrendingUp,
  User,
  Mail,
  FileText,
  Save,
  Award,
  Activity,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import "./ProfilePage.css";

const ACHIEVEMENTS = [
  {
    icon: Target,
    title: "First Step",
    desc: "Complete first task",
    unlocked: true,
  },
  { icon: Flame, title: "On Fire", desc: "7-day streak", unlocked: true },
  { icon: Zap, title: "Hustler", desc: "Complete 10 tasks", unlocked: true },
  {
    icon: Clock,
    title: "Focus Master",
    desc: "5 Pomodoro sessions",
    unlocked: true,
  },
  { icon: Sun, title: "Early Bird", desc: "Task before 8 AM", unlocked: true },
  { icon: Crown, title: "Diamond", desc: "30-day streak", unlocked: false },
  { icon: Trophy, title: "Century", desc: "100 tasks done", unlocked: false },
  {
    icon: Moon,
    title: "Night Owl",
    desc: "Task after midnight",
    unlocked: false,
  },
];

const ACTIVITY = [
  {
    icon: CheckCircle,
    text: 'Completed "Morning workout"',
    time: "2 hours ago",
  },
  {
    icon: PlusCircle,
    text: 'Added "Send invoice to client #47"',
    time: "3 hours ago",
  },
  { icon: Flame, text: "7-day streak achieved!", time: "Today" },
  { icon: Clock, text: "2 Pomodoro sessions completed", time: "Yesterday" },
  {
    icon: CheckCircle,
    text: 'Completed "Team sync meeting prep"',
    time: "2 days ago",
  },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProfilePage() {
  const { user, tasks, updateUser } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    bio: "Productivity enthusiast. Designer & developer.",
  });
  const [saved, setSaved] = useState(false);

  const done = tasks.filter((t) => t.done).length;
  const score = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const xpPct = Math.round(((user.xp % user.xpToNext) / user.xpToNext) * 100);

  function handleSave(e) {
    e.preventDefault();
    updateUser({ name: form.name, email: form.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <motion.div
      className="profile-page"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* Left column: Profile card + Edit form */}
      <div>
        <motion.div className="profile-card" variants={item}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{user.initials}</div>
            <div className="profile-avatar-badge">
              <Zap size={14} />
            </div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-plan-badge">Pro Plan</div>

          <div className="profile-xp-block">
            <div className="profile-xp-header">
              <span>
                Level {user.level} · {user.xp.toLocaleString()} XP
              </span>
              <span className="profile-xp-next">
                {(user.xpToNext - (user.xp % user.xpToNext)).toLocaleString()}{" "}
                to next
              </span>
            </div>
            <div className="xp-bar">
              <motion.div
                className="xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="profile-stats-row">
            {[
              { v: done, l: "Completed", icon: CheckCircle },
              { v: user.streak + "d", l: "Streak", icon: Flame },
              { v: score + "%", l: "Score", icon: TrendingUp },
            ].map((s) => (
              <div key={s.l} className="profile-stat">
                <s.icon size={16} className="profile-stat-icon" />
                <span className="profile-stat-value">{s.v}</span>
                <span className="profile-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: Achievements + Activity */}
        <div>
          <motion.div className="profile-achievements" variants={item}>
            <div className="section-header-icon">
              <Award size={18} />
              <h3 className="pa-title">Achievements</h3>
            </div>
            <div className="badge-grid">
              {ACHIEVEMENTS.map((a) => {
                const Icon = a.icon;
                return (
                  <motion.div
                    key={a.title}
                    className={`badge-item ${!a.unlocked ? "badge-item--locked" : ""}`}
                    whileHover={{ scale: 1.05 }}
                    title={a.desc}
                  >
                    <Icon size={20} className="badge-icon" />
                    <span className="badge-title">{a.title}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div className="profile-streak-card" variants={item}>
            <div className="section-header-icon">
              <Calendar size={18} />
              <h3 className="pa-title">Weekly Streak</h3>
            </div>
            <div className="streak-grid">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className={`streak-cell ${i < user.streak ? "streak-cell--done" : ""} ${i === 6 ? "streak-cell--today" : ""}`}
                >
                  <span className="streak-day-label">{d}</span>
                </div>
              ))}
            </div>
            <p className="streak-msg">
              <Flame size={14} /> {user.streak}-day streak · Keep it going!
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
