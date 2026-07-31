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
          {/* Verdict & Analysis */}
          {fr && (
            <section className="mb-6">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-danger" style={{ opacity: fr.verdict === 'fair' ? 0 : 1 }} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-success" style={{ opacity: fr.verdict === 'fair' ? 1 : 0 }} />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{fr.verdict === 'fair' ? 'FAIR COMPENSATION' : 'POSSIBLE UNDERPAYMENT'}</h3>
                    <div className={`text-xs font-semibold ${fr.verdict === 'fair' ? 'text-success' : 'text-danger'}`}>
                      {fr.verdict === 'fair' ? 'All good' : 'Action Required'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">FAIRNESS SCORE</div>
                    <div className="text-4xl font-bold tabular-nums">
                      <span className={fr.verdict === 'fair' ? 'text-success' : 'text-danger'}>
                        {Math.min(100, Math.round((fr.actual_pay / fr.expected_pay) * 100))}
                      </span>
                      <span className="text-lg text-subtle">/100</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    className={`h-full ${fr.verdict === 'fair' ? 'bg-success' : 'bg-danger'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (fr.actual_pay / fr.expected_pay) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>

                <p className="text-sm font-medium text-foreground mb-6 leading-relaxed">
                  {fr.verdict === 'fair' 
                    ? "This trip appears to be fairly compensated based on local rates."
                    : `You may have been underpaid by ${formatCurrency(fr.expected_pay - fr.actual_pay)} on this ride.`}
                </p>

                <div className="bg-background rounded-xl p-4 mb-5">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-muted">Expected Fare</span>
                    <span className="text-sm font-medium tabular-nums">{formatCurrency(fr.expected_pay)}</span>
                  </div>
                  <div className="flex justify-between mb-3 pb-3 border-b border-border border-dashed">
                    <span className="text-sm text-muted">Actual Fare</span>
                    <span className="text-sm font-medium tabular-nums">{formatCurrency(fr.actual_pay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-foreground">Difference</span>
                    <span className={`text-sm font-bold tabular-nums ${fr.verdict === 'fair' ? 'text-success' : 'text-danger'}`}>
                      {fr.verdict === 'fair' ? 'None' : `-${formatCurrency(fr.expected_pay - fr.actual_pay)}`}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">AI EXPLANATION</span>
                  </div>
                  <p className="text-[13px] text-muted leading-relaxed">
                    {fr.reason_text}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Trip data (Simplified) */}
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Trip Details</h3>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
              {[
                ["Distance", `${job.distance_km} km`],
                ["Duration", `${job.duration_minutes} min`],
                ["Area", job.area_tag || "—"],
                [
                  "Start Time",
                  new Date(job.start_time).toLocaleString("en-IN"),
                ],
                ["Platform", job.platform_id?.charAt(0).toUpperCase() + job.platform_id?.slice(1)],
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
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              AI Safety Analysis
            </h3>
            
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card relative overflow-hidden">
              {loadingSafety ? (
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-4 bg-border rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-border rounded w-full"></div>
                  <div className="h-16 bg-border rounded-xl w-full mt-2"></div>
                </div>
              ) : safety ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-danger" style={{ opacity: safety.score < 8 ? 1 : 0 }} />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-success" style={{ opacity: safety.score >= 8 ? 1 : 0 }} />
                  
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">ROUTE RISK LEVEL</h3>
                      <div className={`text-xs font-semibold ${safety.score >= 8 ? "text-success" : safety.score >= 5 ? "text-warning" : "text-danger"}`}>
                        {safety.score >= 8 ? "Generally Safe" : safety.score >= 5 ? "Exercise Caution" : "High Risk"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">SAFETY SCORE</div>
                      <div className="text-3xl font-bold tabular-nums">
                        <span className={safety.score >= 8 ? "text-success" : safety.score >= 5 ? "text-warning" : "text-danger"}>
                          {safety.score}
                        </span>
                        <span className="text-sm text-subtle">/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden mb-5">
                    <motion.div 
                      className={`h-full ${safety.score >= 8 ? "bg-success" : safety.score >= 5 ? "bg-warning" : "bg-danger"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(safety.score / 10) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  
                  <div className="bg-background rounded-xl p-4 border border-border/50">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={12} className="text-primary" />
                      </div>
                      <p className="text-[13px] text-muted leading-relaxed font-medium">
                        {safety.tip}
                      </p>
                    </div>
                  </div>
                </>
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
