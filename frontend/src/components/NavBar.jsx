// components/NavBar.jsx — Modern bottom navigation
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, MessageSquare, BarChart2, Settings } from "lucide-react";
import clsx from "clsx";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Add Trip", icon: Plus, path: "/add-job" },
  { label: "Chat", icon: MessageSquare, path: "/chatbot" },
  { label: "Insights", icon: BarChart2, path: "/insights" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1 pt-2 pb-5">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        return (
          <button
            key={path}
            id={`nav-${label.toLowerCase().replace(" ", "-")}`}
            className={clsx("nav-tab py-1.5 px-3 rounded-xl transition-all duration-200", {
              active,
              "bg-foreground/5": active,
            })}
            onClick={() => navigate(path)}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2 : 1.5}
              className={active ? "text-foreground" : "text-subtle"}
            />
            <span className={active ? "text-foreground font-semibold" : "text-subtle"}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
