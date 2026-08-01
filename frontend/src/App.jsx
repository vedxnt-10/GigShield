import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { authState } from "./api/client";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import AddJobChooseMethod from "./screens/AddJobChooseMethod";
import AddJobManual from "./screens/AddJobManual";
import AddJobScan from "./screens/AddJobScan";
import FairnessResult from "./screens/FairnessResult";
import JobDetail from "./screens/JobDetail";
import Chatbot from "./screens/Chatbot";
import WeeklyInsights from "./screens/WeeklyInsights";
import ComplaintDraft from "./screens/ComplaintDraft";
import Settings from "./screens/Settings";
import Unsafe from "./screens/Unsafe";
import Layout from "./components/Layout";


const ProtectedRoute = ({ children }) => {
  if (!authState.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            duration: 3000,
            style: {
              background: 'var(--color-foreground)',
              color: 'var(--color-surface)',
              borderRadius: '100px',
              padding: '12px 24px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<Layout><ProtectedRoute><Outlet /></ProtectedRoute></Layout>}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<Home />} />
            <Route path="/add-job" element={<AddJobChooseMethod />} />
            <Route path="/add-job/manual" element={<AddJobManual />} />
            <Route path="/add-job/scan" element={<AddJobScan />} />
            <Route path="/jobs/:jobId/result" element={<FairnessResult />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/insights" element={<WeeklyInsights />} />
            <Route path="/complaints/:jobId" element={<ComplaintDraft />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/unsafe" element={<Unsafe />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
