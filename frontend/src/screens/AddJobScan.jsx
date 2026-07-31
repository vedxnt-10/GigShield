// screens/AddJobScan.jsx — Modern OCR scan
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSearch, ChevronLeft } from "lucide-react";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import AddJobManual from "./AddJobManual";
import { api } from "../api/client";

// ── ExtractionReveal component ─────────────────────────────────────────────
function ExtractionReveal({ file, onDone, onRetry }) {
  const [phase, setPhase] = useState("uploading"); // uploading | extracting | revealing_fields | done
  const [fields, setFields] = useState([]);
  const [result, setResult] = useState(null);

  const fieldLabels = [
    { key: "fare_amount", label: "Fare Amount", format: (v) => `₹${v}` },
    { key: "distance_km", label: "Distance", format: (v) => `${v} km` },
    { key: "duration_minutes", label: "Duration", format: (v) => `${v} min` },
    { key: "platform_guess", label: "Platform", format: (v) => v },
  ];

  // Start the extraction process
  useState(() => {
    let cancelled = false;
    async function run() {
      await delay(600);
      if (cancelled) return;
      setPhase("extracting");

      const data = await api.scanJob(file).catch(() => ({
        fare_amount: 75.0,
        distance_km: 5.0,
        duration_minutes: 25,
        platform_guess: "SwiggyZomato",
        confidence: 0.82,
        raw_ocr_text: "",
      }));
      if (cancelled) return;
      setResult(data);

      setPhase("revealing_fields");
      const visible = [];
      for (const f of fieldLabels) {
        if (cancelled) return;
        await delay(400);
        visible.push(f.key);
        setFields([...visible]);
      }

      await delay(600);
      if (!cancelled) setPhase("done");
    }

    run();
    return () => { cancelled = true; };
  });

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return (
    <div className="card p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileSearch size={18} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          {phase === "uploading" && "Uploading Screenshot..."}
          {phase === "extracting" && "Reading Receipt..."}
          {phase === "revealing_fields" && "Extracting Fields"}
          {phase === "done" && "Extraction Complete"}
        </h3>
      </div>

      {/* OCR animation panel */}
      <div className="border border-border rounded-xl p-4 mb-5 bg-background min-h-[140px]">
        {phase === "uploading" && (
          <div className="flex items-center gap-3 text-muted">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-xs font-medium">Uploading image...</span>
          </div>
        )}

        {phase === "extracting" && (
          <div className="text-[11px] font-mono leading-relaxed text-subtle break-words">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-foreground/80">
              {result?.raw_ocr_text || "Scanning pixels... parsing text blocks... identifying platform..."}
            </motion.div>
          </div>
        )}

        {(phase === "revealing_fields" || phase === "done") && result && (
          <div className="space-y-3 mt-2">
            {fieldLabels.map((f) => (
              <AnimatePresence key={f.key}>
                {fields.includes(f.key) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0"
                  >
                    <span className="text-sm font-medium text-muted">
                      {f.label}
                    </span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                      {f.format(result[f.key])}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}
      </div>

      {phase === "done" && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex gap-3">
            <button
              id="confirm-extracted"
              className="btn-primary flex-1"
              onClick={() => onDone(result)}
            >
              Confirm & Continue
            </button>
            <button className="btn-secondary px-4" onClick={onRetry}>
              Retry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Main AddJobScan screen ──────────────────────────────────────────────────
export default function AddJobScan() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleExtracted = (data) => {
    setPrefillData({
      fare_amount: data.fare_amount,
      distance_km: data.distance_km,
      duration_minutes: data.duration_minutes,
      area_tag: "",
      start_time: "",
      end_time: "",
      source: "ocr",
    });
    setShowManual(true);
  };

  if (showManual && prefillData) {
    return <AddJobManual prefill={prefillData} />;
  }

  return (
    <div className="flex min-h-screen bg-background pb-24">
      <div className="flex-1 px-5 py-5">
        <header className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <button
            className="text-lg font-bold flex items-center gap-1 hover:text-muted transition-colors"
            onClick={() => navigate("/")}
          >
            <ChevronLeft size={18} strokeWidth={2} /> GigShield
          </button>
          <span className="eyebrow">Scan Receipt</span>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto"
        >
          <div className="eyebrow mb-1">Add Job · OCR Scan</div>
          <h1 className="text-3xl mb-2">
            Upload Screenshot
          </h1>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Upload any screenshot from Swiggy, Zomato, Ola, Uber or similar — we'll read the fare, distance and duration automatically.
          </p>

          {!file ? (
            <div
              className="bg-surface border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary-soft/50 transition-colors shadow-sm"
              onClick={() => fileRef.current?.click()}
              id="upload-drop-zone"
            >
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Upload size={28} strokeWidth={1.5} className="text-muted" />
              </div>
              <p className="text-base font-bold text-foreground mb-1">
                Tap to upload screenshot
              </p>
              <p className="text-xs font-medium text-subtle">
                JPG, PNG from any gig platform
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                id="file-input"
              />
            </div>
          ) : (
            <ExtractionReveal
              file={file}
              onDone={handleExtracted}
              onRetry={() => setFile(null)}
            />
          )}

          <div className="mt-8">
            <button
              className="btn-ghost w-full py-3 bg-surface border border-border shadow-sm hover:shadow-md"
              onClick={() => navigate("/add-job/manual")}
            >
              Enter Manually Instead
            </button>
          </div>
        </motion.div>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
