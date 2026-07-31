// screens/Unsafe.jsx — Emergency SOS screen
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, MapPin, X, Navigation } from "lucide-react";
import NavBar from "../components/NavBar";

export default function Unsafe() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        setError("Unable to retrieve your location. Please ensure location services are enabled.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const messageText = location 
    ? `EMERGENCY: I feel unsafe. My current location is: https://maps.google.com/?q=${location.lat},${location.lng}`
    : `EMERGENCY: I feel unsafe. (Unable to grab exact GPS location)`;

  const encodedMessage = encodeURIComponent(messageText);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center h-14">
          <button
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
            onClick={() => navigate("/")}
          >
            <X size={18} strokeWidth={2.5} />
            <span className="text-sm font-medium">Cancel</span>
          </button>
          <span className="text-sm font-bold mx-auto text-danger">Emergency SOS</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-danger rounded-full flex items-center justify-center shadow-lg shadow-danger/30">
              <AlertTriangle size={32} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Are you safe?</h1>
          <p className="text-center text-muted mb-8 leading-relaxed">
            Send an emergency alert with your live location to your trusted contacts or local authorities.
          </p>

          {/* Location Status */}
          <div className="w-full bg-surface border border-border rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${loading ? "text-primary animate-pulse" : location ? "text-success" : "text-danger"}`}>
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 text-foreground">
                  {loading ? "Locating you..." : location ? "Location Acquired" : "Location Failed"}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {loading 
                    ? "Fetching precise GPS coordinates..." 
                    : location 
                      ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                      : error}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-4">
            <a
              href={`sms:?body=${encodedMessage}`}
              className="w-full flex items-center justify-center gap-3 bg-foreground text-surface rounded-2xl p-4 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-float"
            >
              <MessageSquare size={20} />
              Send via SMS
            </a>
            
            <a
              href={`whatsapp://send?text=${encodedMessage}`}
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white rounded-2xl p-4 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-float"
            >
              <Navigation size={20} />
              Send via WhatsApp
            </a>
          </div>

          <p className="text-[11px] font-medium text-muted uppercase tracking-wide leading-relaxed text-center mt-8">
            GigShield does not contact emergency services automatically. If you are in immediate danger, please dial your local emergency number.
          </p>
        </motion.div>
      </div>

      <NavBar />
    </div>
  );
}
