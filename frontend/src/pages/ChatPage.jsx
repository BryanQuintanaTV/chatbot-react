import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Chatbot from '@/components/Chatbot';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { useChat } from '@/contexts/ChatContext';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { WelcomeModal } from '@/components/WelcomeModal';
import logo from '@/assets/images/itch_II_logo.png';
import { Toaster, toast } from "sonner";

export function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const { createNewChat, chats, activeChatId, switchChat, clearChatMessages, deleteChat, activeChat } = useChat();
  const { isReadOnly } = useReadOnly();
  const { isAuthenticated } = useAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const chatInputRef = useRef(null);

  // Show welcome modal for unauthenticated users on first visit of the session
  // Using sessionStorage so modal appears again when user reopens the app
  useEffect(() => {
    if (!isAuthenticated) {
      const dismissed = sessionStorage.getItem('welcome-modal-dismissed');
      console.log('Checking welcome modal - dismissed:', dismissed);
      if (!dismissed) {
        // Show modal after a short delay for better UX
        const timer = setTimeout(() => {
          console.log('Showing welcome modal');
          setShowWelcomeModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        console.log('Welcome modal already dismissed for this session');
      }
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts handlers
  const handleClearChat = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearChat = useCallback(() => {
    if (activeChatId) {
      clearChatMessages(activeChatId);
      toast.success(t('shortcuts.clearChatSuccess'));
    }
  }, [activeChatId, clearChatMessages, t]);

  const handleDeleteChat = useCallback(() => {
    // Only allow deleting if there's more than one chat
    if (chats.length > 1) {
      setShowDeleteConfirm(true);
    } else {
      toast.error(t('chat.cannotDeleteLastChat') || 'No puedes eliminar el último chat');
    }
  }, [chats.length, t]);

  const confirmDeleteChat = useCallback(() => {
    if (activeChatId && chats.length > 1) {
      const success = deleteChat(activeChatId);
      if (success) {
        toast.success(t('chat.deleteSuccess'));
      } else {
        toast.error(t('chat.deleteError'));
      }
    }
  }, [activeChatId, chats.length, deleteChat, t]);

  const { toggleTheme } = useTheme();
  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleFocusInput = useCallback(() => {
    const input = document.getElementById('chat-input');
    if (input) {
      input.focus();
    }
  }, []);

  const handleNavigateChats = useCallback((direction) => {
    const chatIds = chats.map(chat => chat.id);
    const currentIndex = chatIds.indexOf(activeChatId);

    if (direction === 'up' && currentIndex > 0) {
      switchChat(chatIds[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < chatIds.length - 1) {
      switchChat(chatIds[currentIndex + 1]);
    }
  }, [chats, activeChatId, switchChat]);

  const handleGoToChat = useCallback((num) => {
    const chatIds = chats.map(chat => chat.id);
    if (num >= 1 && num <= chatIds.length) {
      switchChat(chatIds[num - 1]);
    }
  }, [chats, switchChat]);

  const handleEscape = useCallback(() => {
    // Priority order for ESC key:
    // 1. Close any open dialogs (handled by Radix UI automatically)
    // 2. Close sidebar only if no dialogs are open
    if (showShortcuts) {
      setShowShortcuts(false);
    } else if (showClearConfirm) {
      setShowClearConfirm(false);
    } else if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
    } else {
      // Only close sidebar if no dialogs are open
      closeSidebar();
    }
  }, [showShortcuts, showClearConfirm, showDeleteConfirm, closeSidebar]);

  // Register keyboard shortcuts
  const shortcuts = useMemo(() => ({
    // Navigation
    'ctrl+b': toggleSidebar,
    'alt+n': createNewChat, // Changed from ctrl+n to avoid browser conflict
    'ctrl+,': () => navigate('/settings'),
    'escape': handleEscape,

    // Chat
    'ctrl+/': handleFocusInput,
    'ctrl+l': handleClearChat,
    'ctrl+shift+backspace': handleDeleteChat, // Delete current chat

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
  }), [toggleSidebar, createNewChat, navigate, handleEscape, handleFocusInput, handleClearChat, handleDeleteChat, handleNavigateChats, handleGoToChat, handleToggleTheme, setShowShortcuts]);

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <Sidebar onShowShortcuts={() => setShowShortcuts(true)} />
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={confirmClearChat}
        title={t('shortcuts.clearChatTitle') || t('chat.clearChat')}
        description={t('shortcuts.clearChatConfirm')}
        confirmText={t('common.confirm') || t('common.ok')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDeleteChat}
        title={t('chat.deleteChat') || t('chat.delete')}
        description={activeChat ? t('chat.deleteConfirm', { title: activeChat.title }) : ''}
        confirmText={t('common.delete') || t('chat.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
      />
      <div
        className={`flex flex-col h-screen w-full overflow-hidden box-border ${isReadOnly ? 'pt-[60px]' : ''}`}
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
                    className="p-2 hover:bg-muted rounded-md text-foreground"
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
