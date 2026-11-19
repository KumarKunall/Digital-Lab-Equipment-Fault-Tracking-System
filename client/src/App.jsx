import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Public & Auth Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SetupPasswordPage from './pages/auth/SetupPasswordPage';
import EquipmentPublicView from './pages/public/EquipmentPublicView';
import RaiseTicketPage from './pages/public/RaiseTicketPage';
import TrackTicketPage from './pages/public/TrackTicketPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageLabs from './pages/admin/ManageLabs';
import ManageAssistants from './pages/admin/ManageAssistants';
import AdminReports from './pages/admin/AdminReports';

// Assistant Pages
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import EquipmentManagement from './pages/assistant/EquipmentManagement';
import CalibrationSchedule from './pages/assistant/CalibrationSchedule';
import TicketQueue from './pages/assistant/TicketQueue';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="p-6 bg-white border border-[#E5EBE6] rounded-2xl shadow-sm text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#087A35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#647067]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard
    const target =
      user.role === 'Admin'
        ? '/admin'
        : user.role === 'Assistant'
        ? '/assistant'
        : '/student';
    return <Navigate to={target} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-password" element={<SetupPasswordPage />} />

      {/* Google Lens QR Code & Fault Reporting (Unauthenticated) */}
      <Route path="/equipment/:publicId" element={<EquipmentPublicView />} />
      <Route path="/equipment/:publicId/report" element={<RaiseTicketPage />} />
      <Route path="/track-ticket" element={<TrackTicketPage />} />

      {/* Admin Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="labs" element={<ManageLabs />} />
        <Route path="assistants" element={<ManageAssistants />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Lab Assistant Portal (Protected with Strict Lab Isolation) */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute allowedRoles={['Assistant']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AssistantDashboard />} />
        <Route path="equipment" element={<EquipmentManagement />} />
        <Route path="calibrations" element={<CalibrationSchedule />} />
        <Route path="tickets" element={<TicketQueue />} />
      </Route>

      {/* Student Portal (Protected) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
