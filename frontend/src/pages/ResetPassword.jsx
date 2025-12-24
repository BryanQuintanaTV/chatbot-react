import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/images/itch_II_logo.png';

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    // Validate token when component mounts
    if (!token) {
      setInvalidToken(true);
    } else {
      // TODO: Validate token with Better Auth backend
      // validateResetToken(token).catch(() => setInvalidToken(true));
    }
  }, [token]);

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
    if (formData.newPassword.length < 6) {
      toast.error(t('register.passwordTooShort'));
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('register.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with Better Auth API call
      // await api.resetPassword({
      //   token,
      //   newPassword: formData.newPassword,
      // });

      setSuccess(true);
      toast.success(t('resetPassword.success'));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(t('resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <img src={logo} className="w-40" alt="logo" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {t('resetPassword.invalidToken')}
            </CardTitle>
            <CardDescription>
              {t('resetPassword.invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/forgot-password">
              <Button variant="default" className="w-full">
                {t('resetPassword.requestNewLink')}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                {t('forgotPassword.backToLogin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <img src={logo} className="w-40" alt="logo" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {t('resetPassword.successTitle')}
            </CardTitle>
            <CardDescription>
              {t('resetPassword.successDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button variant="default" className="w-full">
                {t('resetPassword.goToLogin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <img src={logo} className="w-40" alt="logo" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('resetPassword.title')}</CardTitle>
          <CardDescription>
            {t('resetPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('resetPassword.resetPassword')}
            </Button>

            <Link to="/login">
              <Button variant="ghost" className="w-full">
                {t('forgotPassword.backToLogin')}
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
