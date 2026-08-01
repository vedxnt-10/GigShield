// screens/AddJobChooseMethod.jsx — Modern method picker
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, PenLine, ArrowRight, ChevronLeft, Zap } from "lucide-react";

export default function AddJobChooseMethod() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate("/")}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Log a Trip</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="eyebrow mb-2">Step 1 of 2</div>
          <h1 className="text-3xl mb-2">How to log this trip?</h1>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Scan a payout screenshot for automatic extraction, or type the details in manually.
          </p>

          <div className="space-y-4">
            {/* Scan option */}
            <motion.button
              id="choose-scan"
              className="w-full bg-surface border border-border rounded-2xl p-5 text-left group cursor-pointer relative shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01, borderColor: "rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate("/add-job/scan")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Camera size={24} strokeWidth={1.5} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg font-bold text-foreground">Scan Screenshot</span>
                    <span className="bg-danger text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Upload a payout screenshot — GigShield auto-extracts fare, distance &amp; time in under 15 seconds.
                  </p>
                </div>
                <ArrowRight size={18} strokeWidth={2} className="text-muted/30 group-hover:text-muted/70 transition-colors mt-2 flex-shrink-0" />
              </div>

              {/* Subtle scan animation indicator */}
              <div className="mt-5 flex items-center gap-2 bg-background p-2 rounded-lg border border-border/50">
                <Zap size={12} strokeWidth={2} className="text-muted" />
                <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/40 rounded-full"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ width: "40%" }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted uppercase">~ 15 sec</span>
              </div>
            </motion.button>

            {/* Manual option */}
            <motion.button
              id="choose-manual"
              className="w-full bg-surface border border-border rounded-2xl p-5 text-left group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01, borderColor: "rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate("/add-job/manual")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <PenLine size={24} strokeWidth={1.5} className="text-muted" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg font-bold text-foreground">Enter Manually</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Type the platform, fare, distance, and time yourself. Best when you remember the details.
                  </p>
                </div>
                <ArrowRight size={18} strokeWidth={2} className="text-muted/30 group-hover:text-muted/70 transition-colors mt-2 flex-shrink-0" />
              </div>
            </motion.button>
          </div>

          {/* Info */}
          <div className="mt-8 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wide leading-relaxed text-center">
              Every trip you log is analysed against fair-rate benchmarks for your city and platform type. No app login required.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
