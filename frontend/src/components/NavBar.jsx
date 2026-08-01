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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1 pt-2 pb-5 md:flex-col md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r md:border-t-0 md:pt-14 md:px-4 md:items-start md:justify-start md:gap-2">
      <div className="hidden md:block mb-8 px-4 w-full">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">GigShield</h1>
        <p className="text-xs text-muted mt-1">Worker Dashboard</p>
      </div>
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        return (
          <button
            key={path}
            id={`nav-${label.toLowerCase().replace(" ", "-")}`}
            className={clsx("nav-tab py-1.5 px-3 rounded-xl transition-all duration-200 md:w-full md:flex-row md:items-center md:px-4 md:py-3 md:justify-start md:gap-3", {
              active,
              "bg-foreground/5": active,
              "hover:bg-foreground/5": !active,
            })}
            onClick={() => navigate(path)}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2 : 1.5}
              className={active ? "text-foreground" : "text-subtle"}
            />
            <span className={clsx("text-[10px] md:text-sm transition-colors", active ? "text-foreground font-semibold" : "text-subtle")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
