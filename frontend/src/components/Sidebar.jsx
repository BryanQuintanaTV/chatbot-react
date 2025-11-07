import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import {
  Menu,
  User,
  Settings,
  History,
  LogOut,
  LogIn,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    setOpen(false);
    navigate('/login');
  };

  // Mock chat history - will be replaced with backend data
  const chatHistory = [
    { id: 1, title: 'Información sobre carreras', date: '2025-11-05' },
    { id: 2, title: 'Horarios de biblioteca', date: '2025-11-04' },
    { id: 3, title: 'Proceso de inscripción', date: '2025-11-03' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="h-5 w-5 text-foreground" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('sidebar.menu')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 py-4">
          {/* User Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
              <Avatar className="h-12 w-12">
                {getAvatarDisplay(user).type === 'url' && (
                  <AvatarImage src={getAvatarDisplay(user).value} />
                )}
                {getAvatarDisplay(user).type === 'gradient' && (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarDisplay(user).value} flex items-center justify-center text-white font-semibold`}>
                    {getUserInitials(user?.name)}
                  </div>
                )}
                {getAvatarDisplay(user).type === 'initials' && (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getAvatarDisplay(user).value}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || t('sidebar.user')}</p>
                {user?.semester && user?.career ? (
                  <>
                    <p className="text-xs text-muted-foreground truncate">
                      {t('sidebar.semester')} {user.semester}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t(`careers.${user.career}`)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.semester ? `${t('sidebar.semester')} ${user.semester}` : t('sidebar.completeProfile')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="px-2 py-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                {t('sidebar.loginPrompt')}
              </p>
              <Button
                onClick={handleLogin}
                variant="default"
                size="sm"
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {t('auth.login')}
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('sidebar.chat')}
              </Button>
            </Link>

            {isAuthenticated && (
              <Link to="/settings" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('sidebar.settings')}
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          {/* Theme Toggle */}
          <div className="px-2 flex flex-col gap-2">
            <p className="text-sm font-medium px-2">{t('sidebar.theme')}</p>
            <div className="flex justify-center">
              <AnimatedThemeToggler />
            </div>
          </div>

          {/* Chat History Section */}
          {isAuthenticated && (
            <>
              <Separator />
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <History className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">{t('sidebar.chatHistory')}</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm truncate">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">{chat.date}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Logout Button */}
          {isAuthenticated && (
            <>
              <Separator />
              <div className="px-2">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout')}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
