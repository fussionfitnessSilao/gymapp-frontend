import { Navigate, Route, Routes } from 'react-router-dom';
import CompleteProfileBanner from './components/CompleteProfileBanner';
import InstallBanner from './components/InstallBanner';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HelpPage from './pages/HelpPage';
import InstallGuidePage from './pages/InstallGuidePage';
import LoginPage from './pages/LoginPage';
import MyReservationsPage from './pages/MyReservationsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotificationsPage from './pages/NotificationsPage';
import PackagesPage from './pages/PackagesPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SchedulePage from './pages/SchedulePage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <div className="app-shell">
        <Navbar />
        <CompleteProfileBanner />
        <InstallBanner />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/instalar" element={<InstallGuidePage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/ayuda" element={<HelpPage />} />
          <Route path="/paquetes" element={<PackagesPage />} />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/schedule" replace />} />
        </Routes>
      </div>
      </ToastProvider>
    </AuthProvider>
  );
}
