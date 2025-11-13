import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Zap, Brain, MessageSquare } from 'lucide-react';

export function ModelChangeWarning({ open, onOpenChange, fromModel, toModel, onConfirm, onCancel }) {
  const { t } = useTranslation();

  // Determine the type of change
  const isUpgrade = fromModel === 'pytorch' && (toModel === 'groq' || toModel === 'auto');
  const isDowngrade = (fromModel === 'groq' || fromModel === 'auto') && toModel === 'pytorch';

  // Get model display names
  const fromModelName = fromModel === 'pytorch' ? t('models.pytorch') : t('models.groq');
  const toModelName = toModel === 'pytorch' ? t('models.pytorch') : t('models.groq');

  const getWarningContent = () => {
    if (isUpgrade) {
      return {
        icon: <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />,
        title: `🎉 ${t('modelChange.upgradeTitle')}`,
        description: (
          <div className="space-y-3 text-left">
            <p className="font-medium text-foreground">
              {t('modelChange.createdWith')} <strong>{fromModelName}</strong>, {t('modelChange.selectedWith')} <strong>{toModelName}</strong>.
            </p>
            <p className="font-medium text-foreground">
              {t('modelChange.ifChange', { model: t('models.groq').toLowerCase() })}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>{t('modelChange.benefits.memory')}</strong> {t('modelChange.benefits.memoryDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>{t('modelChange.benefits.fasterResponses')}</strong> {t('modelChange.benefits.fasterResponsesDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>{t('modelChange.benefits.betterUnderstanding')}</strong> {t('modelChange.benefits.betterUnderstandingDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>{t('modelChange.benefits.multilingual')}</strong> {t('modelChange.benefits.multilingualDesc')}</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              {t('modelChange.previousMessagesKept', { model: t('models.groq').toLowerCase() })}
            </p>
          </div>
        ),
        confirmText: t('modelChange.confirmButton'),
        cancelText: t('modelChange.cancelButton'),
      };
    }

    if (isDowngrade) {
      return {
        icon: <MessageSquare className="h-12 w-12 text-orange-500 mx-auto mb-4" />,
        title: `⚠️ ${t('modelChange.downgradeTitle')}`,
        description: (
          <div className="space-y-3 text-left">
            <p className="font-medium text-foreground">
              {t('modelChange.createdWith')} <strong>{fromModelName}</strong>, {t('modelChange.selectedWith')} <strong>{toModelName}</strong>.
            </p>
            <p className="font-medium text-foreground">
              {t('modelChange.ifDowngrade')}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>{t('modelChange.limitations.noMemory')}</strong> {t('modelChange.limitations.noMemoryDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>{t('modelChange.limitations.spanishOnly')}</strong> {t('modelChange.limitations.spanishOnlyDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>{t('modelChange.limitations.slowerResponses')}</strong> {t('modelChange.limitations.slowerResponsesDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>{t('modelChange.limitations.limitedContext')}</strong> {t('modelChange.limitations.limitedContextDesc')}</span>
              </li>
            </ul>
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>{t('modelChange.recommendation')}</strong> {t('modelChange.recommendationText')}
              </p>
            </div>
          </div>
        ),
        confirmText: t('modelChange.confirmButton'),
        cancelText: t('modelChange.cancelButton'),
      };
    }

    // Default case (shouldn't happen)
    return {
      icon: <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
      title: t('modelChange.defaultTitle'),
      description: t('modelChange.defaultDescription'),
      confirmText: t('modelChange.defaultConfirm'),
      cancelText: t('modelChange.defaultCancel'),
    };
  };

  const content = getWarningContent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          {content.icon}
          <AlertDialogTitle className="text-center text-xl">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => {
              if (onCancel) onCancel();
              onOpenChange(false);
            }}
          >
            {content.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={isDowngrade ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
