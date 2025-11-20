import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
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
import { OfflineDetector } from '@/components/OfflineDetector';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
      <OfflineDetector />
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;