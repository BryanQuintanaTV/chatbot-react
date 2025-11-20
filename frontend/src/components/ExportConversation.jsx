import { Download, FileJson, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  exportAsJSON,
  exportAsMarkdown,
  exportAsText,
  downloadFile,
  copyToClipboard,
  generateFilename
} from '@/lib/exportConversation';

export function ExportConversation({ messages, metadata = {} }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!messages || messages.length === 0) {
    return null;
  }

  const handleExportJSON = () => {
    try {
      const content = exportAsJSON(messages, metadata);
      const filename = generateFilename('conversacion', 'json');
      downloadFile(content, filename, 'application/json');
      toast.success(t('export.success'), {
        description: t('export.successJSON')
      });
    } catch (error) {
      toast.error(t('export.error'), {
        description: t('export.errorDescription')
      });
    }
  };

  const handleExportMarkdown = () => {
    try {
      const content = exportAsMarkdown(messages, metadata);
      const filename = generateFilename('conversacion', 'md');
      downloadFile(content, filename, 'text/markdown');
      toast.success(t('export.success'), {
        description: t('export.successMarkdown')
      });
    } catch (error) {
      toast.error(t('export.error'), {
        description: t('export.errorDescription')
      });
    }
  };

  const handleExportText = () => {
    try {
      const content = exportAsText(messages, metadata);
      const filename = generateFilename('conversacion', 'txt');
      downloadFile(content, filename, 'text/plain');
      toast.success(t('export.success'), {
        description: t('export.successText')
      });
    } catch (error) {
      toast.error(t('export.error'), {
        description: t('export.errorDescription')
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const content = exportAsText(messages, metadata);
      const success = await copyToClipboard(content);

      if (success) {
        setCopied(true);
        toast.success(t('export.copied'), {
          description: t('export.successCopy')
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Failed to copy');
      }
    } catch (error) {
      toast.error(t('export.errorCopy'), {
        description: t('export.errorCopyDescription')
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          {t('export.button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('export.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>{t('export.formatJSON')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="mr-2 h-4 w-4" />
          <span>{t('export.formatMarkdown')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportText}>
          <FileText className="mr-2 h-4 w-4" />
          <span>{t('export.formatText')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyToClipboard}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>{copied ? t('export.copied') : t('export.copyClipboard')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
