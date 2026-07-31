// screens/Onboarding.jsx — Modern onboarding screen
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Sparkles, User as UserIcon } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      await api.updateMe({ display_name: name });
      toast.success("Profile saved successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Failed to save profile.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="text-primary w-7 h-7" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GigShield</h1>
        </div>

        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-soft">
          <h2 className="text-xl font-bold text-foreground mb-2">Complete Your Profile</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Welcome! What should we call you?
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-danger-soft border border-danger/20 text-danger text-sm font-medium rounded-xl flex items-center gap-2">
              <Sparkles size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="form-label flex items-center gap-1.5">
                <UserIcon size={14} className="text-muted" /> Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ravi Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field font-medium"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 shadow-soft"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
