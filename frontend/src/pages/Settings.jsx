import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useSidebar } from '@/contexts/SidebarContext';
import { useChat } from '@/contexts/ChatContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useModels } from '@/hooks/useModels';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from '@/components/Sidebar';
import { AvatarPicker } from '@/components/AvatarPicker';
import { getTecnmCareers, SCHOOL_NAME, LANGUAGES, isVacationPeriod } from '@/lib/constants';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import { ArrowLeft, AlertCircle, Lock, Check, Monitor, User, Palette, GraduationCap, Eye, EyeOff, X } from 'lucide-react';
import { notify } from '@/lib/notify';
import { LanguageFlagFlip } from '@/components/LanguageChangeToast';
import { calculatePasswordStrength } from '@/lib/passwordStrength';
import logo from '@/assets/images/itch_II_logo.png';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, changePassword, deleteAccount, logout, isAuthenticated } = useAuth();
  const { theme: currentThemeId, themes: availableThemes, setTheme, toggleTheme, resolvedTheme } = useTheme();
  const themeBg = resolvedTheme ? `hsl(${resolvedTheme.variables['--background']})` : undefined;
  const { isMobile, sidebarState, toggleSidebar, closeSidebar } = useSidebar();
  const { selectedModel, setSelectedModel } = useChat();
  const { models, loading: modelsLoading } = useModels();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Academic fields (semester/career) are locked when the profile is already
  // complete — students may only update them during vacation periods to confirm
  // whether they advanced a semester or changed majors.
  const profileComplete = !!(user?.semester && user?.career);
  const canEditAcademic = !profileComplete || isVacationPeriod();

  const hasProfileChanges =
    formData.semester !== (user?.semester || '') ||
    formData.career !== (user?.career || '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCareerChange = (value) => {
    setFormData({ ...formData, career: value });
  };

  const changeLanguage = (lng) => {
    const fromLang = i18n.language;
    const label = LANGUAGES.find(l => l.value === lng)?.label || lng;
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    notify.show({
      icon: <LanguageFlagFlip fromLang={fromLang} toLang={lng} />,
      title: '',
      duration: 3500,
      styles: { badge: 'sileo-lang-badge' },
      fill: themeBg,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.semester && (formData.semester < 1 || formData.semester > 12)) {
      notify.error({ title: t('settings.semesterError') });
      setLoading(false);
      return;
    }

    try {
      await updateUser({
        name: formData.name,
        semester: formData.semester,
        career: formData.career,
      });
      notify.success({
        title: formData.semester && formData.career
          ? t('settings.profileCompleteSuccess')
          : t('settings.updateSuccess'),
      });
    } catch (error) {
      notify.error({ title: error.message || t('settings.updateError') });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      notify.success({ title: t('settings.accountDeleted') });
      navigate('/');
    } catch (error) {
      notify.error({ title: error.message || 'Error al eliminar la cuenta' });
    }
  };

  const handleAvatarChange = async (newAvatar) => {
    try {
      await updateUser({ avatar: newAvatar });
      notify.success({ title: t('settings.avatarUpdateSuccess') });
    } catch (error) {
      notify.error({ title: error.message || t('settings.avatarUpdateError') });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    if (passwordData.newPassword.length < 8) {
      notify.error({ title: t('register.passwordTooShort') });
      setPasswordLoading(false);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error({ title: t('register.passwordMismatch') });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      notify.success({ title: t('settings.passwordChangeSuccess') });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      const msg = error.message?.startsWith('auth.')
        ? t(error.message)
        : (error.message || t('settings.passwordChangeError'));
      notify.error({ title: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);

  const handleEscape = useCallback(() => {
    if (showShortcuts) setShowShortcuts(false);
    else if (showDeleteAccountConfirm) setShowDeleteAccountConfirm(false);
    else closeSidebar();
  }, [showShortcuts, showDeleteAccountConfirm, closeSidebar]);

  const shortcuts = useMemo(() => ({
    'ctrl+b': toggleSidebar,
    'escape': handleEscape,
    'ctrl+d': handleToggleTheme,
    'ctrl+shift+k': () => setShowShortcuts(true),
  }), [toggleSidebar, handleEscape, handleToggleTheme]);

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <Sidebar onShowShortcuts={() => setShowShortcuts(true)} />
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <ConfirmDialog
        open={showDeleteAccountConfirm}
        onOpenChange={setShowDeleteAccountConfirm}
        onConfirm={confirmDeleteAccount}
        title={t('settings.deleteAccount')}
        description={t('settings.deleteAccountConfirm')}
        confirmText={t('common.delete') || t('settings.deleteAccount')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
      <div
        className="flex flex-col min-h-screen w-full animate-page-enter transition-[margin-left] duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? '0' : (sidebarState === 'expanded' ? '256px' : '64px'),
          '--sidebar-width': isMobile ? '0px' : (sidebarState === 'expanded' ? '256px' : '64px'),
        }}
      >
        <div
          className="flex flex-col min-h-full w-full max-w-3xl px-4 transition-[margin] duration-300 ease-in-out"
          style={{ marginLeft: 'max(0px, calc(50vw - var(--sidebar-width, 0px) - 384px))', marginRight: 'auto' }}
        >
          {/* Header */}
          <header className="sticky top-0 shrink-0 z-20 bg-background border-b">
            <div className="flex items-center h-16 gap-4">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-muted rounded-md text-foreground"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <img src={logo} className="w-16" alt="logo" />
              <h1 className="font-urbanist text-xl font-semibold text-foreground">
                {t('settings.title')}
              </h1>
            </div>
          </header>

          {/* Tabbed layout */}
          <main className="flex-1 py-6">
            <Tabs defaultValue="profile">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="profile" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('settings.profile')}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-1.5">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('settings.security')}</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-1.5">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('settings.appearance')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.profile')}</CardTitle>
                    <CardDescription>{t('settings.profileDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        {getAvatarDisplay(user).type === 'url' && <AvatarImage src={getAvatarDisplay(user).value} />}
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
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <AvatarPicker user={user} onAvatarChange={handleAvatarChange} />
                      </div>
                    </div>

                    <Separator />

                    {(!user?.semester || !user?.career) && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-900 dark:text-amber-100">{t('settings.profileIncomplete')}</p>
                          <p className="text-amber-700 dark:text-amber-200 mt-1">{t('settings.profileIncompleteDescription')}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-1.5">
                          {t('settings.name')}
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </Label>
                        <Input id="name" name="name" type="text" value={formData.name} disabled className="bg-muted cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground">{t('settings.nameReadonly')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('settings.email')}</Label>
                        <Input id="email" name="email" type="email" value={formData.email} disabled className="bg-muted cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground">{t('settings.emailReadonly')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester" className="flex items-center gap-1.5">
                          {t('settings.semester')}
                          {!canEditAcademic && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </Label>
                        <Input
                          id="semester"
                          name="semester"
                          type="number"
                          min="1"
                          max="12"
                          placeholder={t('settings.semesterPlaceholder')}
                          value={formData.semester}
                          onChange={handleChange}
                          disabled={!canEditAcademic}
                          className={!canEditAcademic ? 'bg-muted cursor-not-allowed' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="career" className="flex items-center gap-1.5">
                          {t('settings.career')}
                          {!canEditAcademic && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </Label>
                        <Select
                          value={formData.career}
                          onValueChange={handleCareerChange}
                          disabled={!canEditAcademic}
                        >
                          <SelectTrigger className={!canEditAcademic ? 'bg-muted cursor-not-allowed' : ''}>
                            <SelectValue placeholder={t('settings.careerPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {getTecnmCareers(t).map((career) => (
                              <SelectItem key={career.value} value={career.value}>{career.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!canEditAcademic && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {t('settings.academicFieldsLocked')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>{t('settings.institution')}</Label>
                        <div className="rounded-md bg-muted p-3 text-sm">{SCHOOL_NAME}</div>
                      </div>
                      <Button type="submit" disabled={loading || !hasProfileChanges}>
                        {loading ? t('settings.saving') : t('settings.saveChanges')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">{t('settings.dangerZone')}</CardTitle>
                    <CardDescription>{t('settings.dangerZoneDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={() => setShowDeleteAccountConfirm(true)}>
                      {t('settings.deleteAccount')}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      {t('settings.security')}
                    </CardTitle>
                    <CardDescription>{t('settings.securityDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {/* Current password */}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New password + strength */}
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordData.newPassword && (() => {
                          const strength = calculatePasswordStrength(passwordData.newPassword);
                          return (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{t('auth.passwordStrength')}:</span>
                                <span className={`text-xs font-medium ${
                                  strength.level === 'strong' ? 'text-green-600 dark:text-green-500' :
                                  strength.level === 'medium' ? 'text-yellow-600 dark:text-yellow-500' :
                                  'text-red-600 dark:text-red-500'
                                }`}>
                                  {strength.level === 'strong' ? t('auth.passwordStrong') :
                                   strength.level === 'medium' ? t('auth.passwordMedium') :
                                   t('auth.passwordWeak')}
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    strength.level === 'strong' ? 'bg-green-600' :
                                    strength.level === 'medium' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  }`}
                                  style={{ width: `${strength.percentage}%` }}
                                />
                              </div>
                              <div className="text-xs space-y-1 text-muted-foreground">
                                {[
                                  { key: 'length',    label: t('auth.passwordReqLength') },
                                  { key: 'uppercase', label: t('auth.passwordReqUpper') },
                                  { key: 'lowercase', label: t('auth.passwordReqLower') },
                                  { key: 'number',    label: t('auth.passwordReqNumber') },
                                  { key: 'symbol',    label: t('auth.passwordReqSymbol') },
                                ].map(({ key, label }) => (
                                  <div key={key} className={`flex items-center gap-1 ${strength.checks[key] ? 'text-green-600 dark:text-green-500' : ''}`}>
                                    {strength.checks[key] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                    <span>{label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Confirm password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className={`pr-10 ${
                              passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : passwordData.confirmPassword
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : ''
                            }`}
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordData.confirmPassword && (
                          <div className="flex items-center gap-1 text-xs">
                            {passwordData.newPassword === passwordData.confirmPassword ? (
                              <>
                                <Check className="h-3 w-3 text-green-600 dark:text-green-500" />
                                <span className="text-green-600 dark:text-green-500">{t('auth.passwordsMatch')}</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-red-600 dark:text-red-500" />
                                <span className="text-red-600 dark:text-red-500">{t('register.passwordMismatch')}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? t('settings.changing') : t('settings.changePassword')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.appearance')}</CardTitle>
                    <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{t('settings.theme')}</p>
                        <p className="text-sm text-muted-foreground">{t('settings.themeDescription')}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableThemes.map((themeItem) => (
                          <button
                            key={themeItem.id}
                            onClick={() => setTheme(themeItem.id)}
                            className={`relative flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${
                              currentThemeId === themeItem.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                            }`}
                          >
                            <div className="h-6 w-6 rounded-full border border-border shrink-0" style={{ background: `hsl(${themeItem.variables['--background']})` }} />
                            <span className="truncate">{t(themeItem.nameKey, { defaultValue: themeItem.name })}</span>
                            {currentThemeId === themeItem.id && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                          </button>
                        ))}
                        <button
                          onClick={() => setTheme('system')}
                          className={`relative flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${
                            currentThemeId === 'system' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                        >
                          <Monitor className="h-6 w-6 shrink-0 text-muted-foreground" />
                          <span className="truncate">{t('themes.system')}</span>
                          {currentThemeId === 'system' && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                        </button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('settings.language')}</p>
                        <p className="text-sm text-muted-foreground">{LANGUAGES.find(l => l.value === i18n.language)?.label || 'Español'}</p>
                      </div>
                      <Select value={i18n.language} onValueChange={changeLanguage}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{t('models.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('models.description')}</p>
                      </div>
                      <Select value={selectedModel} onValueChange={setSelectedModel} disabled={modelsLoading}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {models.map((model) => {
                            const requiresAuth = model.id !== 'pytorch';
                            const isDisabled = !model.available || (!isAuthenticated && requiresAuth);
                            return (
                              <SelectItem key={model.id} value={model.id} disabled={isDisabled}>
                                <div className="flex items-center gap-2">
                                  <span>{model.name}</span>
                                  {model.recommended && <span className="text-xs">⭐</span>}
                                  {!model.available && <span className="text-xs text-muted-foreground">({t('models.unavailable')})</span>}
                                  {!isAuthenticated && requiresAuth && <span className="text-xs text-muted-foreground">({t('models.requiresAuth')})</span>}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {selectedModel && models.find(m => m.id === selectedModel) && (
                        <p className="text-xs text-muted-foreground">{models.find(m => m.id === selectedModel)?.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
