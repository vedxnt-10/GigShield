import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
        isDark ? "bg-foreground/10 text-foreground" : "bg-foreground/5 text-foreground"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle Dark Mode"
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 90 : 0,
          opacity: isDark ? 0 : 1
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun size={18} strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
          opacity: isDark ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon size={18} strokeWidth={2} />
      </motion.div>
    </motion.button>
  );
}
