import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

export function OfflineDetector() {
  const { isOnline } = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // User just went offline
      toast.error('Conexión perdida', {
        description: 'No tienes conexión a internet. Verifica tu red.',
        icon: <WifiOff className="h-5 w-5" />,
        duration: Infinity,
        id: 'offline-status'
      });
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      // User came back online
      toast.dismiss('offline-status');
      toast.success('Conexión restaurada', {
        description: 'Volviste a estar en línea.',
        icon: <Wifi className="h-5 w-5" />,
        duration: 3000
      });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión a internet</span>
        </div>
      </div>
    );
  }

  return null;
}
