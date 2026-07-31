// components/SOSButton.jsx — Floating SOS button
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function SOSButton() {
  const navigate = useNavigate();
  return (
    <motion.button
      id="sos-button"
      className="sos-button"
      onClick={() => navigate("/unsafe")}
      title="I Feel Unsafe"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <AlertTriangle size={20} strokeWidth={2.5} />
    </motion.button>
  );
}
