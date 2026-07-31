// screens/Login.jsx — Modern login screen
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, authState } from "../api/client";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.requestOtp(phone);
      setStep("otp");
      toast.success("OTP sent successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(phone, otp);
      authState.setToken(res.access_token);
      toast.success("Logged in successfully");
      if (res.user.onboarding_completed) {
        navigate("/", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldCheck className="text-primary w-7 h-7" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GigShield</h1>
        </div>

        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-soft">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {step === "phone" ? "Sign In" : "Verify Number"}
          </h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            {step === "phone" 
              ? "Enter your phone number to access your trips securely." 
              : `Enter the OTP sent to ${phone}.`}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-danger-soft border border-danger/20 text-danger text-sm font-medium rounded-xl flex items-center gap-2">
              <Sparkles size={14} /> {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
              <div>
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 shadow-soft"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <label className="form-label">
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field tracking-widest text-center text-lg font-mono font-medium"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 shadow-soft"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-center text-sm font-medium text-muted hover:text-foreground mt-1 transition-colors"
              >
                Go Back
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-xs font-medium text-subtle mt-8">
          Fair Pay · Safe Routes · Known Rights
        </p>
      </div>
    </div>
  );
}
