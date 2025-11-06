import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { SCHOOL_NAME } from '@/lib/constants';
import logo from '@/assets/images/itch_II_logo.png';
import { toast } from 'sonner';

export function Login() {
  const { t } = useTranslation();
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
        school: SCHOOL_NAME,
      };

      login(userData);
      toast.success(t('login.success'));
      navigate('/');
    } catch (error) {
      toast.error(t('login.error'));
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
          <h1 className="font-urbanist text-2xl font-semibold">{t('common.appName')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('common.school')}
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('login.title')}</CardTitle>
            <CardDescription>
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@chihuahua2.tecnm.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
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
                {loading ? t('login.loggingIn') : t('login.loginButton')}
              </Button>
              <div className="text-sm text-center space-y-2">
                <p className="text-muted-foreground">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('auth.signUpHere')}
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  <Link to="/" className="text-primary hover:underline">
                    {t('auth.continueWithout')}
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
