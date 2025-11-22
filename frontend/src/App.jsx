import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ReadOnlyProvider } from '@/contexts/ReadOnlyContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatPage } from '@/pages/ChatPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Settings } from '@/pages/Settings';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { HelpCenter } from '@/pages/HelpCenter';
import { ReleaseNotes } from '@/pages/ReleaseNotes';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { ServiceDownPage } from '@/pages/ServiceDownPage';
import { AccountSuspendedPage } from '@/pages/AccountSuspendedPage';
import { OfflineDetector } from '@/components/OfflineDetector';
import { ReadOnlyBanner } from '@/components/ReadOnlyBanner';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useAccountStatus } from '@/hooks/useAccountStatus';

function AppContent({ isReadOnly }) {
  const { isAuthenticated, token } = useAuth();
  const { isSuspended, suspensionInfo } = useAccountStatus(isAuthenticated, token);

  // If account is suspended, show suspension page
  if (isSuspended) {
    return <AccountSuspendedPage suspensionInfo={suspensionInfo} />;
  }

  return (
    <ReadOnlyProvider isReadOnly={isReadOnly}>
      <OfflineDetector />
      {isReadOnly && <ReadOnlyBanner />}
      <ChatProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/release-notes" element={<ReleaseNotes />} />
            </Routes>
          </Router>
        </SidebarProvider>
      </ChatProvider>
    </ReadOnlyProvider>
  );
}

function App() {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // Check if read-only mode is enabled
  const isReadOnlyMode = import.meta.env.VITE_READ_ONLY_MODE === 'true';

  // Check backend health (only if not in maintenance mode)
  const healthCheckEnabled = import.meta.env.VITE_ENABLE_BACKEND_HEALTH_CHECK === 'true';
  const { isHealthy, retryCount, checkNow } = useBackendHealth(
    healthCheckEnabled && !isMaintenanceMode,
    30000
  );

  // If in maintenance mode, show maintenance page
  if (isMaintenanceMode) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
        <MaintenancePage />
      </ThemeProvider>
    );
  }

  // If backend health check is enabled and backend is down, show service down page
  if (healthCheckEnabled && !isHealthy) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
        <ServiceDownPage onRetry={checkNow} retryCount={retryCount} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
      <AuthProvider>
        <AppContent isReadOnly={isReadOnlyMode} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;