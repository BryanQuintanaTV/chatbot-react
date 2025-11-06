import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ChatPage } from '@/pages/ChatPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tec-bot-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;