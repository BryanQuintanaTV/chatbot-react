import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Sidebar } from '@/components/Sidebar';
import { getTecnmCareers, SCHOOL_NAME, LANGUAGES } from '@/lib/constants';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/images/itch_II_logo.png';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    semester: user?.semester || '',
    career: user?.career || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCareerChange = (value) => {
    setFormData({
      ...formData,
      career: value,
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.semester && (formData.semester < 1 || formData.semester > 12)) {
      toast.error(t('settings.semesterError'));
      setLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with Better Auth backend
      const updatedData = {
        ...formData,
        profileCompleted: !!(formData.semester && formData.career),
      };
      updateUser(updatedData);

      if (updatedData.profileCompleted) {
        toast.success(t('settings.profileCompleteSuccess'));
      } else {
        toast.success(t('settings.updateSuccess'));
      }
    } catch (error) {
      toast.error(t('settings.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('settings.deleteAccountConfirm'))) {
      // TODO: Implement actual account deletion with backend
      logout();
      toast.success(t('settings.accountDeleted'));
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
              {t('settings.title')}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile')}</CardTitle>
            <CardDescription>
              {t('settings.profileDescription')}
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

            {/* Profile Completion Warning */}
            {(!user?.semester || !user?.career) && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {t('settings.profileIncomplete')}
                  </p>
                  <p className="text-amber-700 dark:text-amber-200 mt-1">
                    {t('settings.profileIncompleteDescription')}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('settings.name')}</Label>
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
                <Label htmlFor="email">{t('settings.email')}</Label>
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
                <Label htmlFor="semester">{t('settings.semester')}</Label>
                <Input
                  id="semester"
                  name="semester"
                  type="number"
                  min="1"
                  max="12"
                  placeholder={t('settings.semesterPlaceholder')}
                  value={formData.semester}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">{t('settings.career')}</Label>
                <Select value={formData.career} onValueChange={handleCareerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.careerPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getTecnmCareers(t).map((career) => (
                      <SelectItem key={career.value} value={career.value}>
                        {career.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.institution')}</Label>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {SCHOOL_NAME}
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? t('settings.saving') : t('settings.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>
              {t('settings.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.theme')}</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                </p>
              </div>
              <AnimatedThemeToggler />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.language')}</p>
                <p className="text-sm text-muted-foreground">
                  {LANGUAGES.find(l => l.value === i18n.language)?.label || 'Español'}
                </p>
              </div>
              <Select value={i18n.language} onValueChange={changeLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t('settings.dangerZone')}</CardTitle>
            <CardDescription>
              {t('settings.dangerZoneDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              {t('settings.deleteAccount')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
