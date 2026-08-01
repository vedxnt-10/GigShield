import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import SOSButton from "./SOSButton";

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar / NavBar */}
      <NavBar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 md:ml-64 pb-20 md:pb-0 relative">
        {children}
        {/* Global SOS Button */}
        <SOSButton />
      </main>
    </div>
  );
}
