// screens/Home.jsx — Modern clean dashboard
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, ChevronRight, Zap, BarChart3,
  ArrowUpRight, Clock, Package, AlertTriangle, Target, ShieldCheck, Wallet
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { api } from "../api/client";
import { DashboardSkeleton } from "../components/Skeleton";
import ThemeToggle from "../components/ThemeToggle";

const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const weekNum = () => {
  const now = new Date();
  return Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] },
});

// ── Platform bar ──────────────────────────────────────────────────────────
function PlatformBar({ platform, maxEarnings }) {
  const pct = maxEarnings > 0 ? (platform.total_earnings / maxEarnings) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 flex-shrink-0">
        <div className="text-xs font-medium text-muted truncate">
          {platform.platform_name}
        </div>
      </div>
      <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-foreground rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="w-16 text-right">
        <span className="text-sm font-semibold tabular-nums">{fmt(platform.total_earnings)}</span>
        {platform.flagged_count > 0 && (
          <span className="block text-[11px] text-danger font-medium">{platform.flagged_count} flagged</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [goal, setGoal] = useState(null);
  const [goalLoading, setGoalLoading] = useState(true);
  const [settingGoal, setSettingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    Promise.all([api.getWeeklyDashboard(), api.getWeeklyInsight()])
      .then(([dash, ins]) => { setDashboard(dash); setInsight(ins); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    api.getGoal()
      .then(setGoal)
      .catch(() => setGoal(null))
      .finally(() => setGoalLoading(false));
  }, []);

  const handleSetGoal = async () => {
    if (!goalInput) return;
    setSavingGoal(true);
    try {
      const g = await api.setGoal(parseFloat(goalInput));
      setGoal(g);
      setSettingGoal(false);
    } catch (_e) {
      alert("Failed to save goal");
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-surface/70 backdrop-blur-xl border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
            <span className="text-lg font-bold tracking-tight text-foreground/20">GigShield</span>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="card max-w-sm w-full text-center">
          <AlertTriangle size={24} className="text-danger mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-danger mb-2">Backend Offline</p>
          <p className="text-sm text-muted">{error}</p>
          <p className="text-xs mt-3 text-subtle">
            Run: <span className="text-foreground font-medium">uvicorn app.main:app --reload</span>
          </p>
        </div>
      </div>
    );
  }

  const flagged = dashboard?.flagged_count ?? 0;
  const maxEarnings = Math.max(...(dashboard?.platform_split ?? []).map(p => p.total_earnings), 1);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="bg-surface/70 backdrop-blur-xl border-b border-border px-5 pt-safe-top sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <span className="text-lg font-bold tracking-tight">GigShield</span>
          <div className="flex items-center gap-3">
            {flagged > 0 && (
              <span className="bg-danger-soft text-danger text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {flagged} flagged
              </span>
            )}
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center border border-border">
              <span className="text-xs text-foreground font-semibold">RK</span>
            </div>
          </div>
        </div>
      </div>

      {dashboard?.is_fatigued && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-danger-soft text-danger px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 text-center border-b border-danger/20 shadow-sm z-20 relative"
        >
          <AlertTriangle size={18} strokeWidth={2.5} className="flex-shrink-0" />
          <span>{dashboard.fatigue_message}</span>
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto px-5">

        {/* ── Hero Section ───────────────────────────────────────── */}
        <motion.section className="pt-6 pb-5 border-b border-border" {...fadeUp(0)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Wk {weekNum()} · All Platforms
              </div>
              <div className="text-5xl font-bold leading-none mb-2 tabular-nums tracking-tight">
                {fmt(dashboard?.total_earnings ?? 0)}
              </div>
              <p className="text-sm text-muted">
                {dashboard?.total_jobs ?? 0} trips ·{" "}
                {dashboard?.total_hours ?? 0}h ·{" "}
                {flagged > 0
                  ? `${flagged} need review`
                  : "all trips clear"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Savings Goal ───────────────────────────────────────── */}
        <motion.section className="py-5 border-b border-border" {...fadeUp(0.02)}>
          <div className="section-header">
            <div className="text-xs font-semibold text-muted flex items-center gap-1.5 uppercase tracking-wide">
              <Target size={12} />
              Weekly Target
            </div>
          </div>

          {goalLoading ? (
             <div className="card h-24 animate-pulse bg-surface/50" />
          ) : settingGoal ? (
             <div className="card">
               <label className="text-sm font-semibold mb-3 block">Set your target (₹)</label>
               <div className="flex gap-2">
                 <input type="number" className="flex-1 input-field" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="e.g. 5000" autoFocus />
                 <button className="btn-primary" onClick={handleSetGoal} disabled={savingGoal}>{savingGoal ? "Saving..." : "Save"}</button>
                 <button className="btn-ghost" onClick={() => setSettingGoal(false)}>Cancel</button>
               </div>
             </div>
          ) : goal ? (
             <div className="card cursor-pointer hover:-translate-y-px transition-transform group" onClick={() => { setSettingGoal(true); setGoalInput(goal.target_amount); }}>
               <div className="flex justify-between items-end mb-2">
                 <div className="text-sm font-semibold text-foreground">
                   {fmt(goal.current_progress)} <span className="text-muted font-normal text-xs">/ {fmt(goal.target_amount)}</span>
                 </div>
                 <div className="text-xs font-medium text-muted">
                   {Math.min(100, Math.round((goal.current_progress / goal.target_amount) * 100))}%
                 </div>
               </div>
               <div className="h-2.5 bg-border/60 rounded-full overflow-hidden mb-3">
                 <motion.div 
                   className="h-full rounded-full bg-success"
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, (goal.current_progress / goal.target_amount) * 100)}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                 />
               </div>
               <div className="text-[11px] text-muted leading-relaxed font-medium">
                 {goal.suggestion_text}
               </div>
             </div>
          ) : (
             <button className="w-full card border-dashed border-border/80 hover:bg-surface/90 text-sm font-medium text-muted flex items-center justify-center gap-2 py-6 transition-colors" onClick={() => setSettingGoal(true)}>
               <Plus size={16} /> Set a Weekly Savings Goal
             </button>
          )}
        </motion.section>

        {/* ── KPI Grid ───────────────────────────────────────── */}
        <motion.section className="py-5 border-b border-border" {...fadeUp(0.05)}>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Weekly Earnings",
                value: fmt(dashboard?.total_earnings ?? 0),
                icon: Wallet,
                color: "text-foreground",
              },
              {
                label: "Fairness Score",
                value: `${dashboard?.fairness_score ?? 100}/100`,
                icon: ShieldCheck,
                color: (dashboard?.fairness_score ?? 100) > 80 ? "text-success" : "text-warning",
              },
              {
                label: "Underpaid Rides",
                value: flagged,
                icon: AlertTriangle,
                color: flagged > 0 ? "text-danger" : "text-success",
                onClick: () => navigate("/jobs?verdict=underpaid"),
              },
              {
                label: "Hours Worked",
                value: `${dashboard?.total_hours ?? 0}H`,
                icon: Clock,
                color: "text-foreground",
              },
            ].map(({ label, value, icon: Icon, color, onClick }) => (
              <motion.div
                key={label}
                className={`metric-card ${onClick ? "cursor-pointer" : ""}`}
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</span>
                  <Icon size={14} strokeWidth={2} className={`${color} opacity-80`} />
                </div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Weekly Earnings Chart ──────────────────────────────── */}
        <motion.section className="py-5 border-b border-border" {...fadeUp(0.08)}>
          <div className="section-header">
            <div className="text-xs font-semibold text-muted flex items-center gap-1.5 uppercase tracking-wide">
              <BarChart3 size={12} />
              Weekly Earnings
            </div>
          </div>
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.daily_earnings ?? []} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--color-muted))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--color-muted))' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {(dashboard?.daily_earnings ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.underpaid ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* ── AI Insight ─────────────────────────────────────────── */}
        {insight?.insight_text && (
          <motion.section className="py-5 border-b border-border" {...fadeUp(0.1)}>
            <div className="section-header">
              <div className="eyebrow flex items-center gap-1.5">
                <Zap size={12} />
                AI Insight
              </div>
              <button
                className="btn-ghost py-1 px-2 text-xs"
                onClick={() => navigate("/insights")}
              >
                Full report →
              </button>
            </div>
            <div
              className="card cursor-pointer group"
              onClick={() => navigate("/insights")}
            >
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {insight.insight_text}
              </p>
              <div className="flex items-center gap-1 mt-3">
                <span className="text-xs text-muted group-hover:text-foreground transition-colors">
                  See full breakdown
                </span>
                <ArrowUpRight size={12} className="text-muted group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Platform Split ─────────────────────────────────────── */}
        {(dashboard?.platform_split ?? []).length > 0 && (
          <motion.section className="py-5 border-b border-border" {...fadeUp(0.12)}>
            <div className="section-header">
              <div className="text-xs font-semibold text-muted flex items-center gap-1.5">
                <BarChart3 size={12} />
                Platforms
              </div>
            </div>
            <div className="space-y-3">
              {dashboard.platform_split.map((p) => (
                <PlatformBar key={p.platform_id} platform={p} maxEarnings={maxEarnings} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Recent Jobs Timeline ─────────────────────────────────── */}
        <motion.section className="py-5" {...fadeUp(0.15)}>
          <div className="section-header">
            <div className="text-sm font-semibold text-foreground">Today's Timeline</div>
            <button
              className="btn-ghost py-1 px-2 text-xs flex items-center gap-1"
              onClick={() => navigate("/jobs")}
            >
              View All Rides <ChevronRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto pb-4 pt-2 scrollbar-hide">
            <div className="flex items-start min-w-max relative px-2">
              {/* Connecting Background Line */}
              <div className="absolute top-[9px] left-8 right-8 h-0.5 bg-border -z-10" />

              {(dashboard?.recent_jobs ?? []).map((job, i) => {
                const isFair = job.fairness_result?.verdict === "fair";
                const dotColor = isFair ? "bg-success border-success-soft" : "bg-danger border-danger-soft";
                const textColor = isFair ? "text-success" : "text-danger";
                
                return (
                  <motion.div
                    key={job.id}
                    className="flex flex-col items-center w-28 cursor-pointer group"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    whileHover={{ y: -2 }}
                  >
                    <div className={`w-5 h-5 rounded-full border-4 ${dotColor} flex-shrink-0 z-10 mb-3 group-hover:scale-110 transition-transform`} />
                    <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      {fmtTime(job.start_time)}
                    </div>
                    <div className="text-sm font-bold tabular-nums mb-1">
                      {fmt(job.fare_amount)}
                    </div>
                    <div className="text-[10px] text-subtle mb-1.5">
                      {job.distance_km} km
                    </div>
                    <div className={`text-[10px] font-bold ${textColor}`}>
                      {isFair ? "Fair" : "Underpaid"}
                    </div>
                  </motion.div>
                );
              })}

              {!dashboard?.recent_jobs?.length && (
                <div className="w-full text-center py-8">
                  <Package size={24} strokeWidth={1.2} className="text-subtle mx-auto mb-2" />
                  <p className="text-sm text-muted">No trips logged today.</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── Add Job CTA ─────────────────────────────────────────── */}
        <motion.div className="pb-4" {...fadeUp(0.2)}>
          <button
            id="add-job-btn"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            onClick={() => navigate("/add-job")}
          >
            <Plus size={16} strokeWidth={2} />
            Log a New Trip
          </button>
        </motion.div>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
