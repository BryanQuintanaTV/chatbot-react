import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/images/itch_II_logo.png';

export function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    semester: user?.semester || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual backend API call
      updateUser(formData);
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      // TODO: Implement actual account deletion with backend
      logout();
      toast.success('Cuenta eliminada correctamente');
      navigate('/');
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <header className="sticky top-0 shrink-0 z-20 bg-background border-b">
        <div className="flex items-center h-16 gap-4">
          <Sidebar />
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} className="w-24" alt="logo" />
            <h1 className="font-urbanist text-xl font-semibold">
              Configuración
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre</Label>
                <Input
                  id="semester"
                  name="semester"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Institución</Label>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {user?.school || 'Tecnológico Nacional de México Campus Chihuahua II'}
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza la apariencia de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
                </p>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="icon">
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
