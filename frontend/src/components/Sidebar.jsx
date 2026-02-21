import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LANGUAGES } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { LanguageFlagFlip } from '@/components/LanguageChangeToast';
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
import { GeneralReportDialog } from '@/components/GeneralReportDialog';
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
  MessagesSquare,
  ClipboardList,
  Target,
  Star,
  Lightbulb,
  Flame,
  Sparkles,
  Book,
  Newspaper,
  GraduationCap,
  Briefcase,
  Home,
  Gamepad2,
  Music,
  Film,
  Dumbbell,
  Brain,
  Heart,
  Code,
  Coffee,
  Rocket,
  Archive,
  ArchiveRestore,
  Globe,
  Palette,
  Check,
  Monitor,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@/assets/images/itch_II_logo.png';

// Icon mapping (mirrors ChatList.jsx)
const ICON_MAP = {
  MessageSquare, MessagesSquare, FileText, ClipboardList, BookOpen: BookOpen,
  Target, Star, Lightbulb, Flame, Sparkles, Palette, Book, Newspaper,
  GraduationCap, Briefcase, Home, Gamepad2, Music, Film, Dumbbell,
  Brain, Heart, Code, Coffee, Rocket,
};

const getIconComponent = (iconName) => ICON_MAP[iconName] || MessageSquare;

/**
 * ThemeSelector — nested popover showing all available themes + system option.
 */
function ThemeSelector({ isMobile }) {
  const { t } = useTranslation();
  const { theme: currentThemeId, themes, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Palette className="h-4 w-4 mr-2" />
          {t('sidebar.changeTheme')}
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
          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('themes.title')}
          </p>

          {themes.map((themeItem) => (
            <Button
              key={themeItem.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(themeItem.id)}
            >
              <div
                className="h-4 w-4 rounded-full mr-2 border border-border shrink-0"
                style={{
                  background: `hsl(${themeItem.variables['--background']})`,
                }}
              />
              {t(themeItem.nameKey, { defaultValue: themeItem.name })}
              {currentThemeId === themeItem.id && (
                <Check className="h-4 w-4 ml-auto text-primary" />
              )}
            </Button>
          ))}

          <Separator />

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            {t('themes.system')}
            {currentThemeId === 'system' && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * CollapsedChatIcons — vertical list of chat icons when sidebar is collapsed.
 */
function CollapsedChatIcons({ chats, activeChat, showArchived, setShowArchived, isAuthenticated, onChatClick, t }) {
  const filteredChats = chats.filter(chat =>
    showArchived ? chat.archived : !chat.archived
  );

  return (
    <div className="flex-1 flex flex-col items-center gap-1 px-2 pt-1 min-h-0 overflow-hidden">
      {/* Archive toggle icon */}
      {isAuthenticated && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="p-2 rounded-md hover:bg-muted transition-colors shrink-0"
              >
                {showArchived ? (
                  <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Archive className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {showArchived ? (t('chat.showActive') || 'Ver Activos') : (t('chat.showArchived') || 'Ver Archivados')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isAuthenticated && <Separator className="w-8 my-1" />}

      {/* Scrollable chat icons */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full flex flex-col items-center gap-1">
        {filteredChats.map((chat) => {
          const IconComponent = getIconComponent(chat.icon);
          const isActive = chat.id === activeChat?.id;

          return (
            <TooltipProvider key={chat.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onChatClick(chat.id)}
                    className={`relative p-2 rounded-lg transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-primary/15 ring-2 ring-primary/50 shadow-sm shadow-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <IconComponent
                      className="h-5 w-5 transition-transform duration-200"
                      style={{ color: chat.color || (isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))') }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p className="max-w-[200px] truncate">{chat.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ onShowShortcuts }) {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { createNewChat, chats, activeChat, switchChat } = useChat();
  const { sidebarState, toggleSidebar, closeSidebar, isMobile } = useSidebar();
  const { isReadOnly } = useReadOnly();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const themeBg = resolvedTheme ? `hsl(${resolvedTheme.variables['--background']})` : undefined;
  const [chatsOpen, setChatsOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const handleLogout = () => {
    logout();
    notify.success({ title: t('auth.logoutSuccess') });
    navigate('/');
  };

  const toggleLanguage = () => {
    const currentIndex = LANGUAGES.findIndex(lang => lang.value === i18n.language);
    const fromLang = i18n.language;
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    const nextLanguage = LANGUAGES[nextIndex].value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('language', nextLanguage);
    const label = LANGUAGES[nextIndex]?.label || nextLanguage;
    notify.show({
      icon: <LanguageFlagFlip fromLang={fromLang} toLang={nextLanguage} />,
      title: label,
      duration: 3500,
    });
  };

  const handleNewChat = () => {
    // If user is not authenticated and already has 1 conversation, don't allow more
    if (!isAuthenticated && chats.length >= 1) {
      notify.error({ title: t('auth.registerToCreateChats') });
      return;
    }

    createNewChat();
    notify.success({ title: t('chat.newChatCreated') || 'New chat created' });
    // Ensure we're showing active chats (not archived) so new chat is visible
    setShowArchived(false);
    // Ensure chats section is expanded
    setChatsOpen(true);
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

  // Prevent body scroll when sidebar is expanded on mobile (overlay mode)
  useEffect(() => {
    if (isMobile && sidebarState === 'expanded') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarState, isMobile]);

  const isExpanded = sidebarState === 'expanded';
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <>
      {/* Backdrop overlay when sidebar is fully expanded — mobile only */}
      {isMobile && isExpanded && (
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
        style={themeBg ? { backgroundColor: themeBg } : undefined}
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  className={`w-full ${isCollapsed ? 'px-0' : 'justify-start'}`}
                  title={isCollapsed && !isReadOnly ? t('chat.newChat') : undefined}
                  disabled={isReadOnly}
                >
                  <Plus className="h-4 w-4 text-foreground" />
                  {isExpanded && <span className="ml-2 text-foreground">{t('chat.newChat')}</span>}
                </Button>
              </TooltipTrigger>
              {isReadOnly && (
                <TooltipContent>
                  <p>{t('readOnly.newChatDisabled')}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Chats Section - Expanded */}
        {isExpanded && (
          <div className="flex-1 overflow-hidden flex flex-col px-3 min-h-0">
            <Collapsible open={chatsOpen} onOpenChange={setChatsOpen} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 hover:bg-muted flex-shrink-0"
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
              <CollapsibleContent className="flex-1 overflow-hidden mt-2 flex flex-col min-h-0">
                {/* Archive Toggle Button - Only for authenticated users */}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className="mb-2 justify-start text-xs h-8 flex-shrink-0 bg-secondary border border-border hover:bg-accent text-secondary-foreground"
                  >
                    <Archive className="h-3 w-3 mr-2" />
                    {showArchived ? (t('chat.showActive') || 'Ver Activos') : (t('chat.showArchived') || 'Ver Archivados')}
                  </Button>
                )}

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-background" style={themeBg ? { backgroundColor: themeBg } : undefined}>
                  <ChatList onChatSelect={handleChatSelect} showArchived={showArchived} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Collapsed sidebar — chat icons */}
        {isCollapsed && (
          <CollapsedChatIcons
            chats={chats}
            activeChat={activeChat}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            isAuthenticated={isAuthenticated}
            onChatClick={(chatId) => {
              switchChat(chatId);
              navigate('/');
              toggleSidebar();
            }}
            t={t}
          />
        )}

        {/* User Section at Bottom */}
        <div className="border-t p-3">
          <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`${isCollapsed ? 'w-full px-0' : 'p-2 flex-1 justify-start'} h-auto`}
                >
                  {!isAuthenticated ? (
                    /* Guest avatar when not authenticated */
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      {isExpanded && (
                        <div className="ml-2 flex-1 text-left overflow-hidden">
                          <p className="text-sm font-medium text-foreground">{t('sidebar.menu')}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* User avatar when authenticated */
                    <>
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
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 shadow-xl border-2" align="end" side="top" sideOffset={12}>
                {!isAuthenticated ? (
                  /* Menu for non-authenticated users */
                  <div className="space-y-1">
                    {/* Theme Selector */}
                    <ThemeSelector isMobile={isMobile} />

                    {/* Language Toggle */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={toggleLanguage}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {t('sidebar.changeLanguage')} ({LANGUAGES.find(l => l.value === i18n.language)?.label})
                    </Button>

                    <Separator />

                    {/* Release Notes */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/release-notes');
                        closeSidebar();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {t('sidebar.releaseNotes')}
                    </Button>

                    {/* Help Center */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/help');
                        closeSidebar();
                      }}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {t('sidebar.helpCenter')}
                    </Button>

                    <Separator />

                    {/* Login */}
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
                  </div>
                ) : (
                  /* Menu for authenticated users */
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

                    {/* Theme Selector */}
                    <ThemeSelector isMobile={isMobile} />

                    {/* Language Toggle */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={toggleLanguage}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {t('sidebar.changeLanguage')} ({LANGUAGES.find(l => l.value === i18n.language)?.label})
                    </Button>

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
                            onClick={() => {
                              navigate('/help');
                              closeSidebar();
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            {t('sidebar.helpCenter')}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate('/release-notes');
                              closeSidebar();
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {t('sidebar.releaseNotes')}
                          </Button>
                          <GeneralReportDialog>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              {t('sidebar.reportIssue')}
                            </Button>
                          </GeneralReportDialog>
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

                    {/* Logout */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('auth.logout')}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
    </>
  );
}
