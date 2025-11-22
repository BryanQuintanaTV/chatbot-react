import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/images/itch_II_logo.png';

export function ServiceDownPage({ onRetry, retryCount = 0 }) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(30);
  const [isRetrying, setIsRetrying] = useState(false);

  // Countdown for auto-retry
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto retry when countdown reaches 0
          if (onRetry) {
            onRetry();
          }
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRetry]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} className="h-16" alt="Logo" />
        </div>

        {/* Animated Server Icon */}
        <div className="relative flex items-center justify-center h-40">
          {/* Pulse effect */}
          <div className="absolute h-32 w-32 rounded-full bg-destructive/20 dark:bg-destructive/10 animate-ping" />

          {/* Main server icon */}
          <ServerCrash
            className="relative h-24 w-24 text-destructive animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {t('serviceDown.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('serviceDown.description')}
          </p>
        </div>

        {/* Retry Info */}
        <div className="space-y-4 mt-8">
          <div className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg">
            <RefreshCw
              className={`h-8 w-8 text-primary ${isRetrying ? 'animate-spin' : ''}`}
            />

            <p className="text-sm text-muted-foreground">
              {t('serviceDown.retrying', { seconds: countdown })}
            </p>

            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Intentos: {retryCount}
              </p>
            )}
          </div>

          {/* Manual Retry Button */}
          <Button
            onClick={handleManualRetry}
            disabled={isRetrying}
            size="lg"
            className="mt-4"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                {t('serviceDown.checking')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                {t('serviceDown.retry')}
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t('serviceDown.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
