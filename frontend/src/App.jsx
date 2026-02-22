import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ReadOnlyProvider } from '@/contexts/ReadOnlyContext';
import { SystemConfigProvider, useSystemConfig } from '@/contexts/SystemConfigContext';
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
import { AlertBanners } from '@/components/AlertBanners';
import { Toaster as SileoToaster } from 'sileo';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useAccountStatus } from '@/hooks/useAccountStatus';

/**
 * Inner component — has access to both AuthContext and SystemConfigContext.
 * Handles maintenance mode, service-down state, account suspension, and routing.
 */
function AppContent() {
  const { isAuthenticated, token } = useAuth();
  const {
    maintenanceMode,
    maintenanceStartTime,
    enableBackendHealthCheck,
    readOnlyMode,
    configLoading,
    alerts,
    suspensionInfo: sseSupensionInfo,
  } = useSystemConfig();

  // Poll /auth/me for account suspension (also receives push via SSE)
  const { isSuspended, suspensionInfo: polledSuspensionInfo } = useAccountStatus(
    isAuthenticated,
    token
  );

  // Merge SSE-pushed suspension with polled suspension
  const mergedSuspensionInfo = sseSupensionInfo || polledSuspensionInfo;
  const isAccountSuspended = isSuspended || !!sseSupensionInfo;

  // Backend health check (honours DB config instead of VITE_ENABLE_BACKEND_HEALTH_CHECK)
  const { isHealthy, retryCount, checkNow } = useBackendHealth(
    enableBackendHealthCheck && !maintenanceMode,
    30000
  );

  // While fetching config show minimal spinner to avoid flash
  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Maintenance mode — full page takeover
  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  // Backend health check failed
  if (enableBackendHealthCheck && !isHealthy) {
    return <ServiceDownPage onRetry={checkNow} retryCount={retryCount} />;
  }

  return (
    <ReadOnlyProvider>
      <SileoToaster position="top-right" />
      <OfflineDetector />
      {/* Banners stacked from top */}
      <ReadOnlyBanner />
      <AlertBanners isReadOnly={readOnlyMode} />

      <ChatProvider>
        <SidebarProvider>
          <Router>
            {isAccountSuspended ? (
              <Routes>
                <Route
                  path="*"
                  element={
                    <AccountSuspendedPage
                      suspensionInfo={mergedSuspensionInfo}
                    />
                  }
                />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/suspended" element={<AccountSuspendedPage />} />
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
            )}
          </Router>
        </SidebarProvider>
      </ChatProvider>
    </ReadOnlyProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
      {/*
        SystemConfigProvider is outside AuthProvider so it can bootstrap
        maintenance/config state before auth resolves.
        It subscribes to custom 'auth:login' / 'auth:logout' window events
        (dispatched by AuthContext) to switch between SSE and polling.
      */}
      <SystemConfigProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SystemConfigProvider>
    </ThemeProvider>
  );
}

export default App;
