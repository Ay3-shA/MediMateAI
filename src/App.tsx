import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MedicalBanner, MedicalDisclaimerModal } from './components/common/MedicalDisclaimerModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { HealthProfilePage } from './pages/HealthProfilePage';
import { MedicationsPage } from './pages/MedicationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

// Layout wrapper for authenticated dashboard/app pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MedicalDisclaimerModal isOpen={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
      <Navbar />
      <MedicalBanner onOpenModal={() => setDisclaimerOpen(true)} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className={`flex-1 overflow-x-hidden ${isChat ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

          {/* Protected Application Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <AppLayout><ChatPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/chat/:conversationId" element={
            <ProtectedRoute>
              <AppLayout><ChatPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/health-profile" element={
            <ProtectedRoute>
              <AppLayout><HealthProfilePage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/medications" element={
            <ProtectedRoute>
              <AppLayout><MedicationsPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout><HistoryPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout><SettingsPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
