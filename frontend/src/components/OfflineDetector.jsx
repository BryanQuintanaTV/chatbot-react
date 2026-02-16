import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { notify } from '@/lib/notify';

export function OfflineDetector() {
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const offlineToastId = useRef(null);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // User just went offline
      offlineToastId.current = notify.error({
        title: t('offline.lost'),
        description: t('offline.lostDescription'),
        icon: <WifiOff className="h-5 w-5" />,
        duration: null,
      });
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      // User came back online
      if (offlineToastId.current) {
        notify.dismiss(offlineToastId.current);
        offlineToastId.current = null;
      }
      notify.success({
        title: t('offline.restored'),
        description: t('offline.restoredDescription'),
        icon: <Wifi className="h-5 w-5" />,
        duration: 3000,
      });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, t]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff className="h-4 w-4" />
          <span>{t('offline.banner')}</span>
        </div>
      </div>
    );
  }

  return null;
}
