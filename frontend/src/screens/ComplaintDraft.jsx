// screens/ComplaintDraft.jsx — Modern complaint drafting
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Share2, ChevronLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { DetailSkeleton } from "../components/Skeleton";

export default function ComplaintDraft() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.draftComplaint(jobId)
      .then((d) => {
        setDraft(d);
        setText(d.draft_text);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Draft copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: "GigShield Complaint", text });
    } else {
      copy();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background pb-8">
        <div className="flex-1 px-5 py-5 max-w-7xl mx-auto">
          <header className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <button
              className="flex items-center gap-1.5 text-muted transition-colors opacity-50 cursor-default"
            >
              <ChevronLeft size={16} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-sm font-bold mx-auto">Complaint Draft</span>
          </header>
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background pb-8">
      <div className="flex-1 px-5 py-5 max-w-7xl mx-auto">
        <header className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Complaint Draft</span>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="eyebrow mb-1">AI Drafted · Editable</div>
          <h1 className="text-3xl mb-2">
            Complaint to Platform
          </h1>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This letter was drafted using only the facts of your trip. Edit
            as needed, then copy or share it directly to the platform's support
            team.
          </p>

          {/* Editable draft */}
          <div className="mb-6">
            <label className="form-label mb-2">Draft Message</label>
            <textarea
              id="complaint-text"
              className="input-field leading-relaxed resize-none h-64 font-medium"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-[10px] font-medium text-subtle mt-2 uppercase tracking-wide">
              {text.split(" ").length} words · under 120 recommended
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-surface border border-border rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted leading-relaxed">
              This is a draft for informational purposes only. GigShield does
              not submit complaints automatically. Review carefully before
              sending. Not legal advice.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              id="copy-complaint-btn"
              className="btn-primary flex-1 flex items-center justify-center gap-2 shadow-soft"
              onClick={copy}
            >
              {copied ? (
                <>
                  <CheckCircle size={16} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy Text
                </>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="btn-secondary flex items-center justify-center gap-2"
              onClick={share}
            >
              <Share2 size={16} />
              Share
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn-ghost w-full py-3 bg-surface border border-border shadow-sm hover:shadow-md"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>

        <footer className="border-t border-border flex justify-between py-4 mt-10">
          <span className="text-xs font-medium text-muted">
            Document first. Escalate with facts.
          </span>
          <span className="text-xs font-bold text-foreground">GigShield</span>
        </footer>
      </div>
    </div>
  );
}
