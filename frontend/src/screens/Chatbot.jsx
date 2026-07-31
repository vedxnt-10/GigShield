// screens/Chatbot.jsx — Modern chat interface
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, ChevronLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { api } from "../api/client";

const QUICK_QUESTIONS = [
  "Was this fare fair?",
  "What are my rights?",
  "How to file a complaint?",
  "Why lower pay at night?",
];

function fmtTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || null;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello — I'm GigShield's assistant. Ask me anything about trip fairness, your rights as a gig worker, or how to raise a complaint.",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (jobId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I can see you want to discuss a specific trip (···${jobId.slice(-6)}). What would you like to know about it?`,
          ts: new Date(),
        },
      ]);
    }
  }, [jobId]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || sending) return;
    setMessages((m) => [...m, { role: "user", content: msg, ts: new Date() }]);
    setInput("");
    setSending(true);
    try {
      const { reply } = await api.sendMessage(msg, jobId);
      setMessages((m) => [...m, { role: "assistant", content: reply, ts: new Date() }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Connection error — is the backend running?", ts: new Date() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input requires Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.02)] flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="mx-auto flex items-center gap-2">
            <Sparkles size={14} strokeWidth={2} className="text-primary" />
            <span className="text-sm font-bold">Rights Advisor</span>
          </div>
          {jobId && (
            <span className="text-[10px] font-mono text-subtle uppercase">
              ···{jobId.slice(-6)}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary-soft border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <Sparkles size={14} strokeWidth={2} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-[20px] px-4 py-3 shadow-sm ${msg.role === "user"
                    ? "bg-foreground text-surface rounded-br-sm"
                    : "bg-surface border border-border text-foreground rounded-bl-sm"
                  }`}
              >
                <div className={`text-sm leading-relaxed ${msg.role === "assistant" ? "text-foreground/90" : "text-surface/95"}`}>
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div className={`text-[10px] font-medium mt-2 ${msg.role === "user" ? "text-surface/40 text-right" : "text-subtle"}`}>
                  {fmtTime(msg.ts)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-soft border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
              <Sparkles size={14} strokeWidth={2} className="text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-[20px] rounded-bl-sm px-5 py-4 shadow-sm">
              <div className="flex gap-1.5 items-center h-2">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-3 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              className="flex-shrink-0 bg-surface border border-border rounded-full px-4 py-2 text-xs font-semibold text-muted hover:border-muted hover:text-foreground hover:bg-background transition-all whitespace-nowrap shadow-sm"
              onClick={() => send(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-surface px-4 py-3 max-w-2xl mx-auto w-full flex-shrink-0">
        <div className="flex items-center gap-2 bg-background border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 rounded-full px-4 py-2.5 transition-all">
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-subtle"
            placeholder="Ask about your rights..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button
            onClick={toggleVoice}
            className={`transition-colors p-1.5 rounded-full ${listening ? "text-danger bg-danger-soft" : "text-muted hover:text-foreground hover:bg-surface"}`}
          >
            {listening ? <MicOff size={18} strokeWidth={2} /> : <Mic size={18} strokeWidth={2} />}
          </button>
          <button
            id="send-btn"
            className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-foreground/80 hover:shadow-sm"
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
          >
            <Send size={14} strokeWidth={2} className="ml-0.5" />
          </button>
        </div>
        <p className="text-[10px] font-medium text-center text-subtle mt-2">
          AI generated guidance · Not legal advice
        </p>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
