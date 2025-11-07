import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ChatPage } from '@/pages/ChatPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Settings } from '@/pages/Settings';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;