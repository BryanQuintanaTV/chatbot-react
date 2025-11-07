import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useSidebar } from '@/contexts/SidebarContext';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Sidebar } from '@/components/Sidebar';
import { AvatarPicker } from '@/components/AvatarPicker';
import { getTecnmCareers, SCHOOL_NAME, LANGUAGES } from '@/lib/constants';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/images/itch_II_logo.png';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    semester: user?.semester || '',
    career: user?.career || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  const handleAvatarChange = async (newAvatar) => {
    try {
      // TODO: Replace with Better Auth backend when ready
      // If it's a file upload (blob URL), it will be handled by MinIO in backend
      // For now, just update the user context
      updateUser({ avatar: newAvatar });
      toast.success(t('settings.avatarUpdateSuccess'));
    } catch (error) {
      toast.error(t('settings.avatarUpdateError'));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    // Validation
    if (passwordData.newPassword.length < 6) {
      toast.error(t('register.passwordTooShort'));
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('register.passwordMismatch'));
      setPasswordLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with Better Auth API call
      // await api.changePassword({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });

      toast.success(t('settings.passwordChangeSuccess'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(t('settings.passwordChangeError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Sidebar />
      <div
        className="flex flex-col min-h-screen w-full"
        style={{ marginLeft: isMobile ? '0' : '64px' }}
      >
        <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4">
          {/* Header */}
          <header className="sticky top-0 shrink-0 z-20 bg-background border-b">
            <div className="flex items-center h-16 gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <img src={logo} className="w-16" alt="logo" />
              <h1 className="font-urbanist text-xl font-semibold text-foreground">
                {t('settings.title')}
              </h1>
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
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {getAvatarDisplay(user).type === 'url' && (
                    <AvatarImage src={getAvatarDisplay(user).value} />
                  )}
                  {getAvatarDisplay(user).type === 'gradient' && (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarDisplay(user).value} flex items-center justify-center text-white font-semibold text-2xl`}>
                      {getUserInitials(user?.name)}
                    </div>
                  )}
                  {getAvatarDisplay(user).type === 'initials' && (
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getAvatarDisplay(user).value}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <AvatarPicker user={user} onAvatarChange={handleAvatarChange} />
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
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">{t('settings.emailReadonly')}</p>
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

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('settings.security')}
            </CardTitle>
            <CardDescription>
              {t('settings.securityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? t('settings.changing') : t('settings.changePassword')}
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
      </div>
    </>
  );
}
