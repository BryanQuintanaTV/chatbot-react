import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

export function OfflineDetector() {
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // User just went offline
      toast.error(t('offline.lost'), {
        description: t('offline.lostDescription'),
        icon: <WifiOff className="h-5 w-5" />,
        duration: Infinity,
        id: 'offline-status'
      });
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      // User came back online
      toast.dismiss('offline-status');
      toast.success(t('offline.restored'), {
        description: t('offline.restoredDescription'),
        icon: <Wifi className="h-5 w-5" />,
        duration: 3000
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
