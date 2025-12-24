import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export function ReadOnlyBanner() {
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-yellow-500/10 dark:bg-yellow-500/20 border-b border-yellow-500/30 py-3 px-4 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          {t('readOnly.banner')}
        </p>
      </div>
    </div>
  );
}
