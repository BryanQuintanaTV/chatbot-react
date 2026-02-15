import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportAsText } from '@/lib/exportConversation';

export function ShareConversation({ messages, metadata = {} }) {
  const { t } = useTranslation();

  if (!messages || messages.length === 0) {
    return null;
  }

  // Check if Web Share API is supported
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  // Don't show button if Web Share API is not supported
  if (!canShare) {
    return null;
  }

  const handleShare = async () => {
    const content = exportAsText(messages, metadata);
    const title = metadata.title || 'Conversación de Tec Bot';

    try {
      await navigator.share({
        title: title,
        text: content,
      });
      toast.success(t('share.success'), {
        description: t('share.successDescription')
      });
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        toast.error(t('share.error'), {
          description: t('share.errorDescription')
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className=""
    >
      <Share2 className="mr-2 h-4 w-4" />
      {t('share.button')}
    </Button>
  );
}
