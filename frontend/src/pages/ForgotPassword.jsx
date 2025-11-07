import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/images/itch_II_logo.png';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with Better Auth API call
      // await api.forgotPassword({ email });

      setEmailSent(true);
      toast.success(t('forgotPassword.emailSent'));
    } catch (error) {
      toast.error(t('forgotPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <img src={logo} className="w-40" alt="logo" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('forgotPassword.title')}</CardTitle>
          <CardDescription>
            {emailSent
              ? t('forgotPassword.checkEmail')
              : t('forgotPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 rounded-lg bg-muted">
                <Mail className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {t('forgotPassword.emailSentDescription', { email })}
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  {t('forgotPassword.tryAgain')}
                </Button>
                <Link to="/login" className="block">
                  <Button variant="default" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('forgotPassword.backToLogin')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('forgotPassword.sendResetLink')}
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('forgotPassword.backToLogin')}
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('forgotPassword.needHelp')}{' '}
        <a href="mailto:support@chihuahua2.tecnm.mx" className="text-primary hover:underline">
          {t('forgotPassword.contactSupport')}
        </a>
      </p>
    </div>
  );
}
