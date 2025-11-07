import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
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
  HelpCircle,
  BookOpen,
  FileText,
  AlertCircle,
  Keyboard,
  MessageSquare,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/images/itch_II_logo.png';

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { createNewChat } = useChat();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div
      className={`
        fixed left-0 top-0 h-full bg-background border-r border-border
        transition-all duration-300 ease-in-out z-30
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header with Logo/Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && (
            <img src={logo} className="h-8" alt="logo" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0"
          >
            <PanelLeft className={`h-5 w-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            className={`w-full ${collapsed ? 'px-0' : 'justify-start'}`}
            title={collapsed ? t('chat.newChat') : undefined}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">{t('chat.newChat')}</span>}
          </Button>
        </div>

        {/* Chats Section - Collapsible */}
        {!collapsed && (
          <div className="flex-1 overflow-hidden flex flex-col px-3">
            <Collapsible open={chatsOpen} onOpenChange={setChatsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-semibold">{t('sidebar.chats')}</span>
                  </div>
                  {chatsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex-1 overflow-hidden mt-2">
                <div className="h-full overflow-y-auto">
                  <ChatList />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Section at Bottom */}
        <div className="border-t p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {/* User Profile with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`${collapsed ? 'w-full px-0' : 'p-2 flex-1 justify-start'} h-auto`}
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
                  {!collapsed && user && (
                    <div className="ml-2 flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end" side="top">
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

                  <Separator />

                  {/* Help Menu - Nested Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                      >
                        <div className="flex items-center">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          {t('sidebar.help')}
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="end" side="right" sideOffset={8}>
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
                          onClick={() => {/* TODO: Keyboard Shortcuts */}}
                        >
                          <Keyboard className="h-4 w-4 mr-2" />
                          {t('sidebar.keyboardShortcuts')}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Separator />

                  {/* Logout */}
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('auth.logout')}
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            {!collapsed && (
              <div className="shrink-0">
                <AnimatedThemeToggler />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
