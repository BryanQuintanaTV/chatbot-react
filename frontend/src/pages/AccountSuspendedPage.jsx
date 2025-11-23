import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/images/itch_II_logo.png';

export function AccountSuspendedPage({ suspensionInfo: propsSuspensionInfo = {} }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Use suspensionInfo from either location.state (from login error) or props (from useAccountStatus)
  const suspensionInfo = location.state?.suspensionInfo || propsSuspensionInfo;

  const {
    reason,
    suspendedUntil,
    isPermanent = false
  } = suspensionInfo;

  const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleContactSupport = () => {
    // Open email client with pre-filled support email
    const subject = encodeURIComponent('Revisión de Suspensión de Cuenta');
    const body = encodeURIComponent('Hola,\n\nMe gustaría solicitar una revisión de la suspensión de mi cuenta.\n\nGracias.');
    window.location.href = `mailto:soporte@chihuahua2.tecnm.mx?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 animate-in fade-in duration-700">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-in slide-in-from-top duration-500">
          <img src={logo} className="h-16" alt="Logo" />
        </div>

        {/* Icon */}
        <div className="relative flex items-center justify-center h-40 animate-in zoom-in duration-700 delay-150">
          {/* Animated pulse rings */}
          <div className="absolute h-32 w-32 rounded-full bg-destructive/20 dark:bg-destructive/10 animate-ping"
               style={{ animationDuration: '2s' }} />
          <div className="absolute h-32 w-32 rounded-full bg-destructive/30 dark:bg-destructive/15 animate-pulse"
               style={{ animationDuration: '3s' }} />

          {/* Shield Alert Icon with shake animation */}
          <ShieldAlert
            className="relative h-24 w-24 text-destructive animate-in zoom-in duration-500 delay-300"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))',
            }}
          />
        </div>

        {/* Title */}
        <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
          <h1 className="text-4xl font-bold text-foreground">
            {t('suspended.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('suspended.description')}
          </p>
        </div>

        {/* Suspension Details */}
        <div className="space-y-4 mt-8 animate-in slide-in-from-bottom duration-500 delay-500">
          {/* Reason */}
          {reason && (
            <div className="p-4 bg-card border border-border rounded-lg text-left transform transition-all hover:scale-105 hover:shadow-lg">
              <p className="text-sm font-semibold text-foreground mb-2">
                {t('suspended.reason')}
              </p>
              <p className="text-sm text-muted-foreground">
                {reason}
              </p>
            </div>
          )}

          {!reason && (
            <div className="p-4 bg-card border border-border rounded-lg transform transition-all hover:scale-105 hover:shadow-lg">
              <p className="text-sm text-muted-foreground italic">
                {t('suspended.noReason')}
              </p>
            </div>
          )}

          {/* Suspension Duration */}
          <div className="p-4 bg-card border border-border rounded-lg transform transition-all hover:scale-105 hover:shadow-lg">
            <p className="text-sm font-semibold text-foreground mb-2">
              {isPermanent ? t('suspended.permanent') : t('suspended.until')}
            </p>
            {!isPermanent && suspendedUntil && (
              <p className="text-sm text-muted-foreground">
                {formatDate(suspendedUntil)}
              </p>
            )}
            {!isPermanent && !suspendedUntil && (
              <p className="text-sm text-muted-foreground italic">
                Indefinido
              </p>
            )}
          </div>
        </div>

        {/* Contact Support Button */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-700">
          <Button
            onClick={handleContactSupport}
            size="lg"
            className="mt-6 transform transition-all hover:scale-110 hover:shadow-xl"
          >
            <Mail className="mr-2 h-5 w-5" />
            {t('suspended.contact')}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border animate-in fade-in duration-500 delay-1000">
          <p className="text-sm text-muted-foreground">
            {t('suspended.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
