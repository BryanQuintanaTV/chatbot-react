import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChatList } from '@/components/ChatList';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import {
  PanelLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  LogIn,
  HelpCircle,
  BookOpen,
  FileText,
  AlertCircle,
  Keyboard,
  MessageSquare,
  Archive,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/images/itch_II_logo.png';

export function Sidebar({ onShowShortcuts }) {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { createNewChat } = useChat();
  const { sidebarState, toggleSidebar, closeSidebar, isMobile } = useSidebar();
  const navigate = useNavigate();
  const [chatsOpen, setChatsOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewChat = () => {
    createNewChat();
    // Navigate to home page when creating a new chat
    navigate('/');
    // Close sidebar after action
    closeSidebar();
  };

  const handleSettings = () => {
    navigate('/settings');
    // Close sidebar after action
    closeSidebar();
  };

  const handleChatSelect = () => {
    // Navigate to home page when a chat is selected
    navigate('/');
    // Close sidebar after action
    closeSidebar();
  };

  // Prevent body scroll when sidebar is fully expanded
  useEffect(() => {
    if (sidebarState === 'expanded') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarState]);

  const isExpanded = sidebarState === 'expanded';
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <>
      {/* Backdrop overlay when sidebar is fully expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 h-full bg-background border-r border-border
          transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
      <div className="flex flex-col h-full">
        {/* Header with Logo/Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {isExpanded && (
            <img src={logo} className="h-8" alt="logo" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            <PanelLeft className={`h-5 w-5 text-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            className={`w-full ${isCollapsed ? 'px-0' : 'justify-start'}`}
            title={isCollapsed ? t('chat.newChat') : undefined}
          >
            <Plus className="h-4 w-4 text-foreground" />
            {isExpanded && <span className="ml-2 text-foreground">{t('chat.newChat')}</span>}
          </Button>
        </div>

        {/* Chats Section - Collapsible */}
        {isExpanded && (
          <div className="flex-1 overflow-hidden flex flex-col px-3">
            <Collapsible open={chatsOpen} onOpenChange={setChatsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">{t('sidebar.chats')}</span>
                  </div>
                  {chatsOpen ? (
                    <ChevronDown className="h-4 w-4 text-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex-1 overflow-hidden mt-2 flex flex-col">
                {/* Archive Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  className="mb-2 justify-start text-xs h-8"
                >
                  <Archive className="h-3 w-3 mr-2" />
                  {showArchived ? (t('chat.showActive') || 'Ver Activos') : (t('chat.showArchived') || 'Ver Archivados')}
                </Button>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  <ChatList onChatSelect={handleChatSelect} showArchived={showArchived} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Section at Bottom */}
        <div className="border-t p-3">
          {/* User Profile with Popover */}
          <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`${isCollapsed ? 'w-full px-0' : 'p-2 flex-1 justify-start'} h-auto`}
                >
                  <Avatar className="h-8 w-8">
                    {getAvatarDisplay(user).type === 'url' && (
                      <AvatarImage src={getAvatarDisplay(user).value} />
                    )}
                    {getAvatarDisplay(user).type === 'gradient' && (
                      <div className={`w-full h-full bg-gradient-to-br ${getAvatarDisplay(user).value} flex items-center justify-center text-white font-semibold text-sm`}>
                        {getUserInitials(user?.name)}
                      </div>
                    )}
                    {getAvatarDisplay(user).type === 'initials' && (
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getAvatarDisplay(user).value}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {isExpanded && user && (
                    <div className="ml-2 flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 shadow-xl border-2" align="end" side="top" sideOffset={12}>
                <div className="space-y-1">
                  {/* User Info */}
                  {user && (
                    <>
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Settings */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleSettings}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('sidebar.settings')}
                  </Button>

                  {/* Theme Toggle */}
                  <AnimatedThemeToggler
                    variant="ghost"
                    showText={true}
                    text={t('sidebar.changeTheme')}
                    className="w-full justify-start"
                  />

                  <Separator />

                  {/* Help Menu - Nested Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {t('sidebar.help')}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-56 shadow-xl border-2"
                      align={isMobile ? "start" : "end"}
                      side={isMobile ? "top" : "right"}
                      sideOffset={12}
                      alignOffset={isMobile ? -40 : 0}
                    >
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {/* TODO: Help Center */}}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t('sidebar.helpCenter')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {/* TODO: Release Notes */}}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {t('sidebar.releaseNotes')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {/* TODO: Report Issue */}}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {t('sidebar.reportIssue')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={onShowShortcuts}
                        >
                          <Keyboard className="h-4 w-4 mr-2" />
                          {t('sidebar.keyboardShortcuts')}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Separator />

                  {/* Login/Logout */}
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('auth.logout')}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/login');
                        closeSidebar();
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {t('auth.login')}
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
    </>
  );
}
