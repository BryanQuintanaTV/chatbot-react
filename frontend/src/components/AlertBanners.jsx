/**
 * AlertBanners
 *
 * Renders a stack of configurable alert banners sourced from SystemConfigContext.
 * Each alert can be dismissed individually for the current session.
 * Banners appear below any ReadOnlyBanner (which is fixed at top).
 *
 * Banner types: info (blue) | warning (yellow) | error (red) | success (green)
 *
 * Also renders a "scheduled maintenance" banner when a future start-time is set.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, CheckCircle, XCircle, X, Clock } from 'lucide-react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';

// ─── Icon & colour maps ───────────────────────────────────────────────────────
const TYPE_STYLES = {
  info: {
    wrapper: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30',
    text: 'text-blue-700 dark:text-blue-400',
    Icon: Info,
  },
  warning: {
    wrapper: 'bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    Icon: AlertTriangle,
  },
  error: {
    wrapper: 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30',
    text: 'text-red-700 dark:text-red-400',
    Icon: XCircle,
  },
  success: {
    wrapper: 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30',
    text: 'text-green-700 dark:text-green-400',
    Icon: CheckCircle,
  },
};

// ─── Countdown helper ────────────────────────────────────────────────────────
function useCountdown(targetISOString) {
  const [diff, setDiff] = useState(() =>
    targetISOString ? Math.max(0, new Date(targetISOString) - Date.now()) : null
  );

  useEffect(() => {
    if (!targetISOString) return;
    const tick = () =>
      setDiff(Math.max(0, new Date(targetISOString) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISOString]);

  if (diff === null || diff === undefined) return null;
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, ms: diff };
}

// ─── Scheduled Maintenance Banner ────────────────────────────────────────────
function ScheduledMaintenanceBanner({ startTime, endTime, topOffset }) {
  const { t } = useTranslation();
  const countdown = useCountdown(startTime);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !countdown) return null;
  if (countdown.ms <= 0) return null; // Maintenance already started

  const formatCountdown = () => {
    const parts = [];
    if (countdown.days > 0) parts.push(`${countdown.days}d`);
    if (countdown.hours > 0 || countdown.days > 0) parts.push(`${countdown.hours}h`);
    parts.push(`${countdown.minutes}m`);
    parts.push(`${String(countdown.seconds).padStart(2, '0')}s`);
    return parts.join(' ');
  };

  const startDate = new Date(startTime).toLocaleString();
  const endDate = endTime ? new Date(endTime).toLocaleString() : null;

  return (
    <div
      className="fixed left-0 right-0 z-40 border-b backdrop-blur-sm bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30"
      style={{ top: topOffset }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 py-2 px-4 text-yellow-700 dark:text-yellow-400">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium truncate">
            {t('systemConfig.scheduledMaintenance', { date: startDate })}
            {endDate && (
              <span className="ml-1 text-xs opacity-80">
                – {t('systemConfig.maintenanceEnds', { date: endDate })}
              </span>
            )}
          </p>
          <span className="text-xs font-mono shrink-0 opacity-80">{formatCountdown()}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-yellow-500/20 transition-colors"
          aria-label={t('common.dismiss')}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Single configurable alert banner ────────────────────────────────────────
function SingleAlertBanner({ alert, topOffset, onDismiss }) {
  const { i18n } = useTranslation();
  const styles = TYPE_STYLES[alert.type] || TYPE_STYLES.info;
  const { Icon } = styles;

  const message =
    i18n.language === 'en'
      ? (alert.messageEn || alert.translations?.en || alert.messageEs || alert.translations?.es || '')
      : (alert.messageEs || alert.translations?.es || alert.messageEn || alert.translations?.en || '');

  return (
    <div
      className={`fixed left-0 right-0 z-40 border-b backdrop-blur-sm ${styles.wrapper}`}
      style={{ top: topOffset }}
    >
      <div className={`max-w-7xl mx-auto flex items-center justify-between gap-2 py-2 px-4 ${styles.text}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className={`shrink-0 p-1 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10`}
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * AlertBanners
 * @param {number} baseTopOffset  px offset from top (to stack below ReadOnlyBanner if visible)
 * @param {boolean} isReadOnly    whether ReadOnlyBanner is shown (60px)
 */
export function AlertBanners({ isReadOnly = false }) {
  const { alerts = [], maintenanceStartTime, maintenanceEndTime } = useSystemConfig();
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const handleDismiss = (id) =>
    setDismissedIds((prev) => new Set([...prev, id]));

  const now = Date.now();
  const activeAlerts = alerts.filter((a) => {
    if (dismissedIds.has(a.id)) return false;
    const start = a.startTime ? new Date(a.startTime).getTime() : 0;
    const end = a.endTime ? new Date(a.endTime).getTime() : Infinity;
    return now >= start && now < end;
  });

  // Show scheduled maintenance banner only if start time is in the future
  const showScheduledMaintenance =
    maintenanceStartTime && new Date(maintenanceStartTime) > new Date();

  // Stack banners: each is 40px tall
  const BANNER_HEIGHT = 40;
  const baseOffset = isReadOnly ? 60 : 0;

  const banners = [];

  if (showScheduledMaintenance) {
    banners.push(
      <ScheduledMaintenanceBanner
        key="scheduled-maintenance"
        startTime={maintenanceStartTime}
        endTime={maintenanceEndTime}
        topOffset={baseOffset + banners.length * BANNER_HEIGHT}
      />
    );
  }

  activeAlerts.forEach((alert) => {
    banners.push(
      <SingleAlertBanner
        key={alert.id}
        alert={alert}
        topOffset={baseOffset + banners.length * BANNER_HEIGHT}
        onDismiss={handleDismiss}
      />
    );
  });

  if (banners.length === 0) return null;

  return <>{banners}</>;
}

/**
 * Returns the total pixel height occupied by currently visible alert banners.
 * Use this to add padding-top to the page content so nothing is hidden behind banners.
 */
export function useAlertBannersHeight(isReadOnly = false) {
  const { alerts = [], maintenanceStartTime } = useSystemConfig();

  const now = Date.now();
  const activeAlertsCount = alerts.filter((a) => {
    const start = a.startTime ? new Date(a.startTime).getTime() : 0;
    const end = a.endTime ? new Date(a.endTime).getTime() : Infinity;
    return now >= start && now < end;
  }).length;

  const showScheduledMaintenance =
    maintenanceStartTime && new Date(maintenanceStartTime) > new Date();

  const bannerCount = activeAlertsCount + (showScheduledMaintenance ? 1 : 0);
  const readOnlyHeight = isReadOnly ? 60 : 0;

  return readOnlyHeight + bannerCount * 40;
}
