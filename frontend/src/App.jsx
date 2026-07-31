import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/add-job" element={<ProtectedRoute><AddJobChooseMethod /></ProtectedRoute>} />
          <Route path="/add-job/manual" element={<ProtectedRoute><AddJobManual /></ProtectedRoute>} />
          <Route path="/add-job/scan" element={<ProtectedRoute><AddJobScan /></ProtectedRoute>} />
          <Route path="/jobs/:jobId/result" element={<ProtectedRoute><FairnessResult /></ProtectedRoute>} />
          <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><WeeklyInsights /></ProtectedRoute>} />
          <Route path="/complaints/:jobId" element={<ProtectedRoute><ComplaintDraft /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/unsafe" element={<ProtectedRoute><Unsafe /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
