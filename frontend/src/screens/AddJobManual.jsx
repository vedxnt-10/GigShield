import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="form-label">
      {label}
      {error && <span className="ml-2 text-danger font-semibold">· {error}</span>}
    </label>
    {children}
  </div>
);

export default function AddJobManual({ prefill = {} }) {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [form, setForm] = useState({
    platform_id: prefill.platform_id || "",
    fare_amount: prefill.fare_amount || "",
    distance_km: prefill.distance_km || "",
    start_time: prefill.start_time || "",
    end_time: prefill.end_time || "",
    duration_minutes: prefill.duration_minutes || "",
    area_tag: prefill.area_tag || "",
    source: prefill.source || "manual",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  useEffect(() => {
    api.getPlatforms().then((res) => {
      setPlatforms(res);
      if (res.length > 0 && !form.platform_id) {
        update("platform_id", res[0].id);
      }
    }).catch(console.error);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.fare_amount || isNaN(form.fare_amount)) e.fare_amount = "Required";
    if (!form.distance_km || isNaN(form.distance_km)) e.distance_km = "Required";
    if (!form.start_time) e.start_time = "Required";
    if (!form.end_time) e.end_time = "Required";
    if (!form.duration_minutes || isNaN(form.duration_minutes)) e.duration_minutes = "Required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const job = await api.createJob({
        platform_id: form.platform_id,
        source: form.source,
        fare_amount: parseFloat(form.fare_amount),
        distance_km: parseFloat(form.distance_km),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        duration_minutes: parseInt(form.duration_minutes),
        area_tag: form.area_tag || undefined,
      });
      toast.success("Trip saved successfully!");
      navigate(`/jobs/${job.id}/result`);
    } catch (err) {
      toast.error(err.message || "Failed to save trip.");
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate("/add-job")}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-bold mx-auto">Log a Trip</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="eyebrow mb-1.5">Manual Entry</div>
          <h1 className="text-3xl mb-1">Enter Trip Details</h1>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Fill in what you were paid — we'll immediately check if it was fair.
          </p>

          {/* Platform selector — visual cards */}
          <div className="mb-6">
            <label className="form-label mb-2">Platform</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p) => (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  key={p.id}
                  type="button"
                  onClick={() => update("platform_id", p.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-150 ${form.platform_id === p.id
                      ? "border-primary bg-primary-soft text-primary shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-surface text-foreground hover:border-foreground/30 hover:bg-background"
                    }`}
                >
                  <div className={`text-sm font-bold ${form.platform_id === p.id ? "text-primary" : ""}`}>
                    {p.name}
                  </div>
                  <div className={`text-[11px] font-medium uppercase tracking-wide mt-1 ${form.platform_id === p.id ? "text-primary/70" : "text-subtle"}`}>
                    {p.type}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5 mb-6">
            {/* Fare + Distance row */}
            <div className="grid grid-cols-2 gap-4">
              <Field id="fare-amount" label="Fare (₹)" error={errors.fare_amount}>
                <input
                  id="fare-amount"
                  type="number"
                  step="0.01"
                  placeholder="62.00"
                  className="input-field tabular-nums"
                  value={form.fare_amount}
                  onChange={(e) => update("fare_amount", e.target.value)}
                />
              </Field>
              <Field id="distance-km" label="Distance (km)" error={errors.distance_km}>
                <input
                  id="distance-km"
                  type="number"
                  step="0.1"
                  placeholder="4.8"
                  className="input-field tabular-nums"
                  value={form.distance_km}
                  onChange={(e) => update("distance_km", e.target.value)}
                />
              </Field>
            </div>

            <Field id="duration-minutes" label="Duration (minutes)" error={errors.duration_minutes}>
              <input
                id="duration-minutes"
                type="number"
                placeholder="22"
                className="input-field tabular-nums"
                value={form.duration_minutes}
                onChange={(e) => update("duration_minutes", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="start-time" label="Start Time" error={errors.start_time}>
                <input
                  id="start-time"
                  type="datetime-local"
                  className="input-field"
                  value={form.start_time}
                  onChange={(e) => update("start_time", e.target.value)}
                />
              </Field>
              <Field id="end-time" label="End Time" error={errors.end_time}>
                <input
                  id="end-time"
                  type="datetime-local"
                  className="input-field"
                  value={form.end_time}
                  onChange={(e) => update("end_time", e.target.value)}
                />
              </Field>
            </div>

            <Field id="area-tag" label="Area (optional)">
              <input
                id="area-tag"
                type="text"
                placeholder="e.g. Koramangala, HSR Layout"
                className="input-field"
                value={form.area_tag}
                onChange={(e) => update("area_tag", e.target.value)}
              />
            </Field>
          </div>

          {errors.submit && (
            <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
              <Zap size={16} className="text-danger mt-0.5" />
              <p className="text-sm font-medium text-danger">{errors.submit}</p>
            </div>
          )}

          {/* Fairness preview hint */}
          <div className="bg-primary-soft border border-primary/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5 shadow-sm">
            <Zap size={16} strokeWidth={2} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-primary/80 leading-relaxed">
              Fairness check runs instantly after saving — we'll compare against fair-rate benchmarks for your platform and city.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            id="save-job-btn"
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-soft"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking Fairness...
              </>
            ) : (
              <>
                <Zap size={16} strokeWidth={2} />
                Save & Check Fairness
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
