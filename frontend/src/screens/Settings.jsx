// screens/Settings.jsx — Modern settings screen
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, User, Bell, Globe, LogOut } from "lucide-react";
import SOSButton from "../components/SOSButton";
import NavBar from "../components/NavBar";
import { api, authState } from "../api/client";

const SETTINGS_ITEMS = [
  { icon: Bell, label: "Notifications", sub: "Underpayment alerts enabled" },
  { icon: Globe, label: "Language", sub: "English (EN)" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getMe().then(data => setProfile(data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    authState.clearToken();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background pb-24">
      <div className="flex-1 px-5 py-5 max-w-2xl mx-auto">
        <header className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <div className="text-lg font-bold cursor-pointer" onClick={() => navigate("/")}>
            GigShield
          </div>
          <span className="eyebrow">Settings</span>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="eyebrow mb-1">Account & Preferences</div>
          <h1 className="text-3xl mb-6">Settings</h1>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-background transition-colors border-b border-border/60">
              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <User size={20} strokeWidth={2} className="text-muted" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Profile</div>
                <div className="text-sm font-medium text-muted">
                  {profile ? `${profile.display_name} · ${profile.phone_number}` : "Loading..."}
                </div>
              </div>
            </div>

            {SETTINGS_ITEMS.map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-background transition-colors ${i < SETTINGS_ITEMS.length - 1 ? "border-b border-border/60" : ""
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} strokeWidth={2} className="text-muted" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{label}</div>
                  <div className="text-sm font-medium text-muted">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-danger/20 text-danger hover:bg-danger-soft transition-colors py-4 rounded-xl text-sm font-bold shadow-sm"
          >
            <LogOut size={16} strokeWidth={2} /> Log Out
          </button>

          <div className="mt-8">
            <div className="eyebrow mb-2">About GigShield</div>
            <div className="bg-surface border border-border rounded-xl px-4 py-4 shadow-sm text-center">
              <p className="text-xs font-medium text-subtle leading-relaxed">
                Fair Pay · Safe Routes · Known Rights<br />
                Built for gig workers.
              </p>
            </div>
          </div>
        </motion.div>

        <footer className="border-t border-border flex justify-between py-4 mt-8">
          <span className="text-xs font-medium text-muted">
            Your data. Your rights.
          </span>
          <span className="text-xs font-bold text-foreground">GigShield</span>
        </footer>
      </div>

      <SOSButton />
      <NavBar />
    </div>
  );
}
