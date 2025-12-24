import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Wrench } from 'lucide-react';
import logo from '@/assets/images/itch_II_logo.png';

export function MaintenancePage() {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Parse maintenance end time from env
  const maintenanceEndTime = import.meta.env.VITE_MAINTENANCE_END_TIME
    ? new Date(import.meta.env.VITE_MAINTENANCE_END_TIME)
    : null;

  useEffect(() => {
    if (!maintenanceEndTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = maintenanceEndTime - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        // Reload page when maintenance is over
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [maintenanceEndTime]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} className="h-16" alt="Logo" />
        </div>

        {/* Animated Icons */}
        <div className="relative flex items-center justify-center h-40">
          {/* Rotating gear background */}
          <Settings
            className="absolute h-32 w-32 text-primary/20 dark:text-primary/10 animate-spin"
            style={{ animationDuration: '8s' }}
          />

          {/* Main wrench icon */}
          <Wrench
            className="relative h-20 w-20 text-primary animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {t('maintenance.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('maintenance.description')}
          </p>
        </div>

        {/* Countdown Timer */}
        {timeRemaining && (
          <div className="space-y-4 mt-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('maintenance.countdown')}
            </p>

            <div className="flex justify-center gap-4">
              {timeRemaining.days > 0 && (
                <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 min-w-[80px]">
                  <span className="text-3xl font-bold text-primary">
                    {timeRemaining.days}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase mt-1">
                    {t('maintenance.days')}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 min-w-[80px]">
                <span className="text-3xl font-bold text-primary">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground uppercase mt-1">
                  {t('maintenance.hours')}
                </span>
              </div>

              <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 min-w-[80px]">
                <span className="text-3xl font-bold text-primary">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground uppercase mt-1">
                  {t('maintenance.minutes')}
                </span>
              </div>

              <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 min-w-[80px]">
                <span className="text-3xl font-bold text-primary">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground uppercase mt-1">
                  {t('maintenance.seconds')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message when no end time is specified */}
        {!maintenanceEndTime && (
          <div className="mt-8 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('maintenance.noEstimate')}
            </p>
          </div>
        )}

        {/* Almost ready message */}
        {timeRemaining && timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes < 10 && (
          <div className="animate-bounce">
            <p className="text-lg font-semibold text-primary">
              {t('maintenance.almostReady')}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t('maintenance.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
