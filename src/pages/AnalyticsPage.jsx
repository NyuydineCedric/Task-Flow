import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useApp } from "../context/AppContext";
import "./AnalyticsPage.css";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const WEEKLY = [
  { day: "Mon", completed: 4, target: 5 },
  { day: "Tue", completed: 7, target: 5 },
  { day: "Wed", completed: 5, target: 5 },
  { day: "Thu", completed: 9, target: 6 },
  { day: "Fri", completed: 6, target: 5 },
  { day: "Sat", completed: 3, target: 3 },
  { day: "Sun", completed: 2, target: 2 },
];

const MONTHLY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  tasks: Math.floor(Math.random() * 8) + 1,
  focus: +(Math.random() * 3 + 0.5).toFixed(1),
}));

const HEATMAP = Array.from({ length: 56 }, () => Math.floor(Math.random() * 5));
const COLORS = ["#E2E8F0", "#BBF7D0", "#86EFAC", "#4ADE80", "#16C47F"];

export default function AnalyticsPage() {
  const { tasks, user } = useApp();
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.filter((t) => !t.done).length;
  const score = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const byCat = ["Work", "Personal", "Study", "Health", "Finance"]
    .map((c) => {
      const ct = tasks.filter((t) => t.category === c);
      const cd = ct.filter((t) => t.done).length;
      return {
        category: c,
        total: ct.length,
        completed: cd,
        rate: ct.length ? Math.round((cd / ct.length) * 100) : 0,
      };
    })
    .filter((c) => c.total > 0);

  return (
    <motion.div
      className="analytics-page"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <motion.div className="analytics-stats" variants={stagger}>
        {[
          {
            icon: BarChart3,
            label: "Completed",
            value: done,
            sub: "All time",
            color: "var(--green)",
            bg: "#dcfce7",
          },
          {
            icon: TrendingUp,
            label: "Score",
            value: `${score}%`,
            sub: "+8% this month",
            color: "var(--purple)",
            bg: "#ede9fe",
          },
          {
            icon: Target,
            label: "Streak",
            value: `${user.streak}d`,
            sub: "Personal best",
            color: "var(--amber)",
            bg: "var(--amber-light)",
          },
          {
            icon: Zap,
            label: "Focus Time",
            value: "3.2h",
            sub: "+15% avg",
            color: "var(--blue)",
            bg: "var(--blue-light)",
          },
        ].map((s) => (
          <motion.div key={s.label} className="ana-stat-card" variants={item}>
            <div
              className="ana-stat-icon"
              style={{ background: s.bg, color: s.color }}
            >
              <s.icon size={19} />
            </div>
            <div className="ana-stat-value">{s.value}</div>
            <div className="ana-stat-label">{s.label}</div>
            <div className="ana-stat-sub">{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="analytics-grid">
        {/* Weekly bar chart */}
        <motion.div
          className="ana-card"
          variants={item}
          style={{ gridColumn: "span 2" }}
        >
          <div className="ana-card-header">
            <h3 className="ana-card-title">Weekly Completions</h3>
            <span className="ana-card-sub">Tasks completed vs target</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY} barGap={4} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "var(--text3)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--text3)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "var(--shadow-md)",
                }}
                itemStyle={{ color: "var(--text)" }}
                labelStyle={{ fontWeight: 600, color: "var(--text)" }}
              />
              <Bar
                dataKey="target"
                fill="var(--bg3)"
                radius={[5, 5, 0, 0]}
                name="Target"
              />
              <Bar
                dataKey="completed"
                fill="#16C47F"
                radius={[5, 5, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category breakdown */}
        <motion.div className="ana-card" variants={item}>
          <div className="ana-card-header">
            <h3 className="ana-card-title">By Category</h3>
          </div>
          {byCat.map((c) => (
            <div key={c.category} className="ana-cat-row">
              <div className="ana-cat-top">
                <span className="ana-cat-name">{c.category}</span>
                <span className="ana-cat-pct">
                  {c.completed}/{c.total} · {c.rate}%
                </span>
              </div>
              <div className="prog-track">
                <motion.div
                  className="prog-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${c.rate}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Monthly trend */}
        <motion.div className="ana-card" variants={item}>
          <div className="ana-card-header">
            <h3 className="ana-card-title">30-Day Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY.slice(-14)}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16C47F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16C47F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--text3)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text3)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
                itemStyle={{ color: "var(--text)" }}
              />
              <Area
                type="monotone"
                dataKey="tasks"
                stroke="#16C47F"
                strokeWidth={2}
                fill="url(#areaGrad)"
                name="Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity heatmap */}
      <motion.div
        className="ana-card"
        variants={item}
        style={{ marginTop: 16 }}
      >
        <div className="ana-card-header">
          <h3 className="ana-card-title">Activity Heatmap — Last 8 Weeks</h3>
          <div className="heatmap-legend">
            <span style={{ fontSize: 11, color: "var(--text3)" }}>Less</span>
            {COLORS.map((c) => (
              <span
                key={c}
                className="heatmap-swatch"
                style={{ background: c }}
              />
            ))}
            <span style={{ fontSize: 11, color: "var(--text3)" }}>More</span>
          </div>
        </div>
        <div className="heatmap-grid">
          {HEATMAP.map((v, i) => (
            <motion.div
              key={i}
              className="heatmap-cell"
              style={{ background: COLORS[v] }}
              title={`${v} tasks`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.006, duration: 0.2 }}
              whileHover={{ scale: 1.25 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
