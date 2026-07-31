// screens/JobDetail.jsx — Modern job detail view
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, FileText, ChevronLeft, Send, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import VerdictBadge from "../components/VerdictBadge";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { DetailSkeleton } from "../components/Skeleton";
import { api } from "../api/client";

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safety, setSafety] = useState(null);
  const [loadingSafety, setLoadingSafety] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const openChat = () => {
    setChatOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: `I'm here to help with this specific trip. What would you like to know?` }]);
    }
  };

  const sendChat = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const { reply } = await api.sendMessage(msg, jobId);
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: "Failed to connect to backend." }]);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await api.deleteJob(jobId);
        navigate("/", { replace: true });
      } catch (err) {
        alert("Failed to delete trip: " + err.message);
      }
    }
  };

  useEffect(() => {
    api.getJob(jobId)
      .then(setJob)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    setLoadingSafety(true);
    api.getJobSafetyScore(jobId)
      .then(setSafety)
      .catch(console.error)
      .finally(() => setLoadingSafety(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-surface border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
            <button
              className="flex items-center gap-1.5 text-muted transition-colors opacity-50 cursor-default"
            >
              <ChevronLeft size={16} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-sm font-bold mx-auto">Trip Detail</span>
            <div className="w-16" />
          </div>
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="card text-center">
          <p className="text-sm text-muted">Job not found.</p>
        </div>
      </div>
    );
  }

  const fr = job.fairness_result;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Trip Detail</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Verdict */}
          {fr && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Verdict</h3>
              <div className="flex items-baseline gap-3">
                <VerdictBadge verdict={fr.verdict} />
                <span className="text-3xl font-bold">
                  {formatCurrency(fr.actual_pay)}
                </span>
              </div>
              <p className="text-sm mt-2 text-muted max-w-md leading-relaxed">
                {fr.reason_text}
              </p>
            </section>
          )}

          {/* Trip data */}
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Trip Data</h3>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
              {[
                ["Fare Paid", formatCurrency(job.fare_amount)],
                fr && ["Expected Fair Rate", formatCurrency(fr.expected_pay)],
                ["Distance", `${job.distance_km} km`],
                ["Duration", `${job.duration_minutes} min`],
                ["Area", job.area_tag || "—"],
                [
                  "Start Time",
                  new Date(job.start_time).toLocaleString("en-IN"),
                ],
                ["Source", job.source?.charAt(0).toUpperCase() + job.source?.slice(1)],
              ]
                .filter(Boolean)
                .map(([k, v], i, arr) => (
                  <div
                    key={k}
                    className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-border/60" : ""
                      }`}
                  >
                    <span className="text-sm text-muted">{k}</span>
                    <span className="text-sm font-medium tabular-nums">{v}</span>
                  </div>
                ))}
            </div>
          </section>

          {/* AI Safety Analysis */}
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">AI Safety Analysis</h3>
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
              {loadingSafety ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="h-4 bg-border rounded w-1/3"></div>
                  <div className="h-3 bg-border rounded w-full"></div>
                </div>
              ) : safety ? (
                <div className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${safety.score >= 8 ? "bg-success-soft text-success border border-success/30" : safety.score >= 5 ? "bg-warning-soft text-warning border border-warning/30" : "bg-danger-soft text-danger border border-danger/30"}`}>
                    {safety.score}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">{safety.score >= 8 ? "Generally Safe" : safety.score >= 5 ? "Exercise Caution" : "High Risk"}</h4>
                    <p className="text-sm text-muted leading-relaxed">{safety.tip}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">Safety data unavailable.</p>
              )}
            </div>
          </section>

          {/* Actions & Inline Chat */}
          <div className="flex flex-col gap-3">
            {!chatOpen ? (
              <button
                id="job-detail-chat-btn"
                className="btn-secondary flex items-center justify-center gap-2"
                onClick={openChat}
              >
                <MessageSquare size={16} />
                Ask Chatbot About This Job
              </button>
            ) : (
              <div className="border border-border bg-surface rounded-2xl p-4 shadow-card flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted border-b border-border pb-3">
                  <Sparkles size={14} className="text-primary" />
                  AI Assistant
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 max-h-64 pr-1 scrollbar-hide">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-foreground text-surface rounded-br-sm' : 'bg-background border border-border text-foreground rounded-bl-sm shadow-sm'}`}>
                        {m.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        ) : m.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-1 items-center h-4 ml-2">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 input-field text-sm"
                    placeholder="Ask about this job..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    autoFocus
                  />
                  <button
                    className="w-10 flex items-center justify-center bg-foreground text-surface rounded-xl disabled:opacity-40 transition-opacity"
                    onClick={sendChat}
                    disabled={sending || !input.trim()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}

            {fr && (fr.verdict === "underpaid" || fr.verdict === "borderline") && (
              <button
                id="job-detail-complaint-btn"
                className="btn-secondary flex items-center justify-center gap-2 border-danger/30 text-danger hover:bg-danger hover:text-white hover:border-danger"
                onClick={() => navigate(`/complaints/${jobId}`)}
              >
                <FileText size={16} />
                Draft a Complaint
              </button>
            )}

            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>

            <button
              className="flex items-center justify-center gap-2 border border-danger/20 text-danger hover:bg-danger-soft transition-colors py-3 mt-4 text-sm font-medium w-full rounded-xl"
              onClick={handleDelete}
            >
              <Trash2 size={14} /> Delete Trip
            </button>
          </div>
        </motion.div>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
