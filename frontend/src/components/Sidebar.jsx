import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
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
import {
  Menu,
  User,
  Settings,
  History,
  LogOut,
  LogIn,
  Moon,
  Sun,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
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
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 py-4">
          {/* User Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.semester ? `Semestre ${user.semester}` : 'Estudiante'}
                </p>
                {user?.school && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.school}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="px-2 py-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                Inicia sesión para obtener respuestas personalizadas
              </p>
              <Button
                onClick={handleLogin}
                variant="default"
                size="sm"
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>

            {isAuthenticated && (
              <Link to="/settings" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          {/* Theme Toggle */}
          <div className="px-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="w-full justify-start"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Modo Oscuro
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Modo Claro
                </>
              )}
            </Button>
          </div>

          {/* Chat History Section */}
          {isAuthenticated && (
            <>
              <Separator />
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <History className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">Historial de Chats</h3>
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
                  Cerrar Sesión
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
