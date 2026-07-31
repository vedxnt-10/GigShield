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
      if (res.display_name) {
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
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-foreground/10 rotate-3">
            <ShieldCheck className="text-surface w-8 h-8 -rotate-3" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">GigShield</h1>
          <p className="text-muted font-medium text-center text-sm max-w-[260px] leading-relaxed">
            Take back control of your gig earnings and drive with confidence.
          </p>
        </div>

        <div className="bg-surface/80 backdrop-blur-3xl border border-border p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-warning/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-xl font-extrabold text-foreground mb-2">
            {step === "phone" ? "Welcome Back" : "Verify Number"}
          </h2>
          <p className="text-sm text-muted font-medium mb-8 leading-relaxed">
            {step === "phone" 
              ? "Enter your phone number to access your trips securely." 
              : `We've sent a secure OTP to ${phone}.`}
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
        
        <p className="text-center text-[10px] font-bold text-muted uppercase tracking-widest mt-10">
          Fair Pay · Safe Routes · Known Rights
        </p>
      </div>
    </div>
  );
}
