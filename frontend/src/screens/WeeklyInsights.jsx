// screens/WeeklyInsights.jsx — Modern insights
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, PieChart as PieChartIcon, ShieldAlert } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import StatStamp from "../components/StatStamp";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { api } from "../api/client";

import { DetailSkeleton } from "../components/Skeleton";

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function WeeklyInsights() {
  const navigate = useNavigate();
  const [insight, setInsight] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getWeeklyInsight(), api.getWeeklyDashboard()])
      .then(([ins, dash]) => {
        setInsight(ins);
        setDashboard(dash);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-surface/70 backdrop-blur-xl border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center h-14">
            <button
              className="flex items-center gap-1.5 text-muted transition-colors opacity-50 cursor-default"
            >
              <ChevronLeft size={16} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-sm font-bold mx-auto">Weekly Insights</span>
          </div>
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="bg-surface/70 backdrop-blur-xl border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Weekly Insights</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5">
        {/* Hero */}
        <motion.section
          className="pt-6 pb-5 border-b border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="eyebrow mb-1">Earnings Overview</div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                {formatCurrency(insight?.total_earnings ?? 0)}
              </h1>
              <div className="flex gap-6 text-sm text-muted font-medium">
                <span>{insight?.total_hours ?? 0}h worked</span>
                <span>{insight?.flagged_count ?? 0} flagged trips</span>
              </div>
            </div>
            <StatStamp
              lines={[`₹${Math.round(insight?.total_earnings ?? 0)}`, "THIS", "WEEK"]}
              color="ink"
            />
          </div>
        </motion.section>

        {/* AI Insight */}
        <motion.section
          className="py-6 border-b border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="eyebrow mb-3">AI Analysis · This Week</div>
          <div className="card">
            <p className="text-sm leading-relaxed text-foreground/90 font-medium">
              {insight?.insight_text ??
                "[No AI insight available — set GEMINI_API_KEY to enable.]"}
            </p>
          </div>
        </motion.section>

        {/* Data Visualizations */}
        {(dashboard?.platform_split?.length > 0 || dashboard?.total_jobs > 0) && (
          <motion.section
            className="py-6 border-b border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4">
              
              {/* Platform Split Donut */}
              {dashboard.platform_split.length > 0 && (
                <div className="card flex flex-col items-center">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5 w-full">
                    <PieChartIcon size={12} />
                    Platform Split
                  </div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboard.platform_split.map(p => ({ name: p.platform_name, value: p.total_earnings }))}
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {dashboard.platform_split.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#171717', '#737373', '#a3a3a3', '#e5e5e5'][index % 4]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val) => `₹${val}`} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Fairness Ratio Donut */}
              {dashboard.total_jobs > 0 && (
                <div className="card flex flex-col items-center">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5 w-full">
                    <ShieldAlert size={12} />
                    Fairness Ratio
                  </div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fair', value: dashboard.total_jobs - dashboard.flagged_count },
                            { name: 'Flagged', value: dashboard.flagged_count }
                          ]}
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#16a34a" />
                          <Cell fill="#dc2626" />
                        </Pie>
                        <RechartsTooltip formatter={(val) => `${val} trips`} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Week dates */}
        <motion.section
          className="pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="eyebrow mb-2">Period</div>
          <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
              <Calendar size={16} className="text-muted" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {new Date(insight?.week_start).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
              })}
              {" — "}
              {new Date(
                new Date(insight?.week_start).getTime() + 6 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
            </span>
          </div>
        </motion.section>

        <button className="btn-primary w-full py-4 shadow-soft" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>

        <footer className="border-t border-border flex justify-between py-4 mt-10">
          <span className="text-xs font-medium text-muted">
            Patterns reveal what single trips can't.
          </span>
          <span className="text-xs font-bold text-foreground">GigShield</span>
        </footer>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
