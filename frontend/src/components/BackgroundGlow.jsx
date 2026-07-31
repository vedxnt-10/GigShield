import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function BackgroundGlow() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background transition-colors duration-500">
      {/* 
        Subtle mesh gradient effect. 
        In light mode, it's very soft pastel. 
        In dark mode, it's deep glowing purples. 
      */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut"
        }}
        className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-40 mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 ${
          isDark ? "bg-indigo-900" : "bg-violet-300"
        }`}
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut"
        }}
        className={`absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-30 mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 ${
          isDark ? "bg-fuchsia-900" : "bg-blue-300"
        }`}
      />
    </div>
  );
}
