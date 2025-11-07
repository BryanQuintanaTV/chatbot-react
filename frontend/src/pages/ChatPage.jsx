import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Chatbot from '@/components/Chatbot';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/components/theme-provider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import logo from '@/assets/images/itch_II_logo.png';
import { Toaster, toast } from "sonner";

export function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const { createNewChat, chats, currentChatId, setCurrentChatId, clearMessages } = useChat();
  const { setTheme, theme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const chatInputRef = useRef(null);

  // Keyboard shortcuts handlers
  const handleClearChat = () => {
    if (window.confirm(t('shortcuts.clearChatConfirm'))) {
      clearMessages();
      toast.success(t('shortcuts.clearChatSuccess'));
    }
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFocusInput = () => {
    // We'll need to get the input from Chatbot component
    const input = document.querySelector('textarea[placeholder*="Escribe"]') ||
                  document.querySelector('textarea[placeholder*="Write"]');
    if (input) {
      input.focus();
    }
  };

  const handleNavigateChats = (direction) => {
    const chatIds = Object.keys(chats);
    const currentIndex = chatIds.indexOf(currentChatId);

    if (direction === 'up' && currentIndex > 0) {
      setCurrentChatId(chatIds[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < chatIds.length - 1) {
      setCurrentChatId(chatIds[currentIndex + 1]);
    }
  };

  const handleGoToChat = (num) => {
    const chatIds = Object.keys(chats);
    if (num >= 1 && num <= chatIds.length) {
      setCurrentChatId(chatIds[num - 1]);
    }
  };

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    // Navigation
    'ctrl+b': toggleSidebar,
    'ctrl+n': createNewChat,
    'ctrl+,': () => navigate('/settings'),
    'escape': closeSidebar,

    // Chat
    'ctrl+/': handleFocusInput,
    'ctrl+l': handleClearChat,

    // Chat navigation
    'ctrl+arrowup': () => handleNavigateChats('up'),
    'ctrl+arrowdown': () => handleNavigateChats('down'),
    'ctrl+1': () => handleGoToChat(1),
    'ctrl+2': () => handleGoToChat(2),
    'ctrl+3': () => handleGoToChat(3),
    'ctrl+4': () => handleGoToChat(4),
    'ctrl+5': () => handleGoToChat(5),
    'ctrl+6': () => handleGoToChat(6),
    'ctrl+7': () => handleGoToChat(7),
    'ctrl+8': () => handleGoToChat(8),
    'ctrl+9': () => handleGoToChat(9),

    // Appearance
    'ctrl+d': handleToggleTheme,

    // Utilities
    'ctrl+shift+k': () => setShowShortcuts(true),
  });

  return (
    <>
      <Sidebar onShowShortcuts={() => setShowShortcuts(true)} />
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
      <div
        className='flex flex-col h-screen w-full overflow-hidden'
        style={{ marginLeft: isMobile ? '0' : '64px' }}
      >
        <Toaster richColors position="top-right" />
        <div className='flex flex-col h-full w-full max-w-7xl mx-auto px-4'>
          <header className='shrink-0 z-20 bg-background border-b'>
            <div className='flex flex-col h-full w-full gap-1 pt-4 pb-2'>
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-muted rounded-md"
                    aria-label="Toggle sidebar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <a href='https://chihuahua2.tecnm.mx/'>
                  <img src={logo} className='w-32' alt='logo' />
                </a>
              </div>
              <h1 className='font-urbanist text-[1.65rem] font-semibold text-foreground'>{t('common.appName')}</h1>
              <p className='font-urbanist text-destructive text-md font-light'>{t('common.testMode')}</p>
            </div>
          </header>
          <Chatbot />
        </div>
      </div>
    </>
  );
}
