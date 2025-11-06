import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import logo from '@/assets/images/itch_II_logo.png';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with actual backend authentication
    // For now, we'll simulate a login with frontend-only logic
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data - In real implementation, this would come from backend
      const userData = {
        id: '1',
        email: email,
        name: 'Usuario Demo',
        semester: '5',
        school: 'Tecnológico Nacional de México Campus Chihuahua II',
      };

      login(userData);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center space-y-2">
          <img src={logo} className="w-32" alt="logo" />
          <h1 className="font-urbanist text-2xl font-semibold">Tec Bot</h1>
          <p className="text-sm text-muted-foreground">
            Tecnológico Nacional de México Campus Chihuahua II
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
              <div className="text-sm text-center space-y-2">
                <p className="text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  <Link to="/" className="text-primary hover:underline">
                    Continuar sin iniciar sesión
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
