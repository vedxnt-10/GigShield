// screens/FairnessResult.jsx — Modern verdict reveal
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileText, ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { api } from "../api/client";

// ── Stamp with spring animation ──────────────────────────────────────────
function VerdictStamp({ verdict }) {
  const cfg = {
    underpaid: { lines: ["Under", "paid"], cls: "border-danger/20 text-danger bg-danger-soft" },
    borderline: { lines: ["Border", "line"], cls: "border-warning/30 text-warning bg-warning-soft" },
    fair:       { lines: ["Rate", "Fair"], cls: "border-success/30 text-success bg-success-soft" },
  }[verdict] ?? { lines: ["—"], cls: "border-border text-subtle bg-surface" };

  return (
    <motion.div
      className={`w-20 h-20 rounded-full border-2 ${cfg.cls} text-[11px]
                  font-bold flex flex-col items-center justify-center text-center`}
      initial={{ scale: 1.5, rotate: -8, opacity: 0 }}
      animate={{ scale: 1.0, rotate: 7, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.2 }}
    >
      {cfg.lines.map((l, i) => (
        <div key={i} className="leading-tight uppercase tracking-widest">{l}</div>
      ))}
    </motion.div>
  );
}

// ── Typewriter ───────────────────────────────────────────────────────────
function TypewriterText({ text, delay = 0 }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!text) return;
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <>{shown}</>;
}

// ── Verdict color helpers ─────────────────────────────────────────────────
const verdictColors = {
  underpaid: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger/20", icon: AlertCircle },
  borderline: { bg: "bg-warning-soft", text: "text-warning", border: "border-warning/30", icon: AlertTriangle },
  fair: { bg: "bg-success-soft", text: "text-success", border: "border-success/30", icon: CheckCircle2 },
};

import { DetailSkeleton } from "../components/Skeleton";

export default function FairnessResult() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    api.getJob(jobId)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    const t = setTimeout(() => setShowActions(true), 2200);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-surface border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center justify-center h-14">
            <span className="text-sm font-bold">Fairness Analysis</span>
          </div>
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  const job = result;
  const fr = job?.fairness_result;
  if (!job || !fr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="card text-center max-w-xs">
          <p className="text-sm text-muted">No fairness result found.</p>
          <button className="btn-secondary mt-4 w-full" onClick={() => navigate("/")}>Back Home</button>
        </div>
      </div>
    );
  }

  const vc = verdictColors[fr.verdict] ?? verdictColors.fair;
  const VerdictIcon = vc.icon;
  const diffPct = fr.expected_pay > 0
    ? Math.abs(Math.round((1 - fr.actual_pay / fr.expected_pay) * 100))
    : 0;
  const isNegative = fr.verdict !== "fair";

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate("/")}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Fairness Check</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5">

        {/* ── Hero Verdict ──────────────────────────────────────────── */}
        <motion.section
          className="pt-8 pb-6 border-b border-border"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="eyebrow mb-3">Verdict · Trip Analysis</div>

              {/* Large verdict display */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${vc.bg} ${vc.border} mb-3 shadow-sm`}>
                  <VerdictIcon size={14} strokeWidth={2.5} className={vc.text} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${vc.text}`}>
                    {fr.verdict === "underpaid" ? "Possible Underpayment" :
                     fr.verdict === "borderline" ? "Borderline" : "Fair Rate"}
                  </span>
                </div>

                <div className="text-5xl font-bold tabular-nums leading-none mb-2 tracking-tight">
                  ₹{fr.actual_pay}
                </div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                  paid · fair rate ₹{fr.expected_pay}
                </div>

                {isNegative && (
                  <motion.div
                    className="flex items-center gap-2 mt-4 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  >
                    <span className={`text-2xl font-bold tabular-nums ${vc.text}`}>{diffPct}%</span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${vc.text}/80`}>below benchmark</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <VerdictStamp verdict={fr.verdict} />
          </div>
        </motion.section>

        {/* ── Reason ───────────────────────────────────────────────── */}
        <motion.section
          className="py-6 border-b border-border"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <div className="eyebrow mb-3">Explanation</div>
          <div className={`rounded-2xl p-5 border ${vc.border} ${vc.bg} shadow-sm`}>
            <p className="text-sm font-medium leading-relaxed text-foreground/90">
              <TypewriterText text={fr.reason_text} delay={900} />
            </p>
          </div>
        </motion.section>

        {/* ── Comparison ───────────────────────────────────────────── */}
        <motion.section
          className="py-6 border-b border-border"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        >
          <div className="eyebrow mb-3">Breakdown</div>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
            {[
              ["Fare You Received", `₹${fr.actual_pay}`, fr.verdict !== "fair" ? "text-danger font-bold" : "text-success font-bold"],
              ["Fair Rate Floor", `₹${fr.expected_pay}`, "text-foreground font-semibold"],
              isNegative && ["Shortfall", `${diffPct}% (₹${Math.round(fr.expected_pay - fr.actual_pay)})`, `${vc.text} font-bold`],
            ].filter(Boolean).map(([label, val, cls], i, arr) => (
              <div
                key={label}
                className={`flex justify-between items-center px-5 py-4 ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <span className="text-sm font-medium text-muted">{label}</span>
                <span className={`text-lg tabular-nums ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Trip details ─────────────────────────────────────────── */}
        <motion.section
          className="py-6 border-b border-border"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
        >
          <div className="eyebrow mb-3">Trip Details</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Distance", `${job.distance_km} km`],
              ["Duration", `${job.duration_minutes} min`],
              ["Area", job.area_tag || "—"],
              ["Time", new Date(job.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface rounded-xl border border-border px-4 py-3 shadow-sm">
                <div className="text-[11px] font-semibold text-muted mb-1">{k}</div>
                <div className="text-sm font-bold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {showActions && (
            <motion.section
              className="py-6 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <button
                id="ask-chatbot-btn"
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 shadow-soft"
                onClick={() => navigate(`/chatbot?jobId=${jobId}`)}
              >
                <MessageSquare size={16} strokeWidth={2.5} />
                Ask the Chatbot
              </button>

              {isNegative && (
                <button
                  id="draft-complaint-btn"
                  className="btn-secondary w-full flex items-center justify-center gap-2 py-4 border-danger/30 text-danger hover:bg-danger hover:text-white hover:border-danger bg-surface"
                  onClick={() => navigate(`/complaints/${jobId}`)}
                >
                  <FileText size={16} strokeWidth={2} />
                  Draft a Complaint
                </button>
              )}

              <button
                className="btn-ghost w-full flex items-center justify-center gap-1 mt-2"
                onClick={() => navigate("/")}
              >
                Back to Dashboard <ArrowRight size={14} />
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
