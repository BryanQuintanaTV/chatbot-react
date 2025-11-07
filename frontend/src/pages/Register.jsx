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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { SCHOOL_NAME } from '@/lib/constants';
import logo from '@/assets/images/itch_II_logo.png';
import { toast } from 'sonner';

export function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isValidSchoolEmail = (email) => {
    return email.endsWith('@chihuahua2.tecnm.mx');
  };

  const showEmailWarning = emailTouched && formData.email && !isValidSchoolEmail(formData.email);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('register.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(t('register.success'));
      navigate('/settings'); // Redirect to settings to complete profile
    } catch (error) {
      toast.error(error.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center space-y-2">
          <img src={logo} className="w-32" alt="logo" />
          <h1 className="font-urbanist text-2xl font-semibold">{t('common.appName')}</h1>
          <p className="text-sm text-muted-foreground text-center">
            {t('common.school')}
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('register.title')}</CardTitle>
            <CardDescription>
              {t('register.description')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('register.namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                  className={showEmailWarning ? 'border-yellow-500 focus-visible:ring-yellow-500' : ''}
                  required
                />
                {showEmailWarning && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{t('auth.schoolEmailRecommended') || 'Se recomienda usar correo institucional (@chihuahua2.tecnm.mx)'}</span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p className="text-xs">
                  {t('register.profileNote')}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('register.registering') : t('register.registerButton')}
              </Button>
              <div className="text-sm text-center space-y-2">
                <p className="text-muted-foreground">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('auth.signInHere')}
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  <Link to="/" className="text-primary hover:underline">
                    {t('auth.continueWithoutRegister')}
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
