// components/StatStamp.jsx — Modern metric circle
import { motion } from "framer-motion";

export default function StatStamp({ lines, color = "danger" }) {
  const borderColor = {
    danger: "border-danger/40 text-danger",
    alert: "border-danger/40 text-danger",
    fair: "border-success/40 text-success",
    success: "border-success/40 text-success",
    caution: "border-warning/40 text-warning",
    warning: "border-warning/40 text-warning",
    ink: "border-foreground/20 text-foreground",
  }[color] ?? "border-danger/40 text-danger";

  return (
    <motion.div
      className={`w-16 h-16 rounded-full border-2 ${borderColor} font-semibold text-[11px]
                  flex flex-col items-center justify-center text-center bg-surface shadow-sm`}
      initial={{ rotate: 0, opacity: 0 }}
      animate={{ rotate: 3, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {lines.map((line, i) => (
        <div key={i} className="leading-tight">
          {line}
        </div>
      ))}
    </motion.div>
  );
}
