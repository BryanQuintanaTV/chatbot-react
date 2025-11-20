import { Share2, Copy, FileJson, FileText, Check } from 'lucide-react';
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
  copyToClipboard,
  downloadFile,
  generateFilename
} from '@/lib/exportConversation';

export function ShareConversation({ messages, metadata = {} }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!messages || messages.length === 0) {
    return null;
  }

  // Check if Web Share API is supported
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleShareAsText = async () => {
    const content = exportAsText(messages, metadata);
    const title = metadata.title || 'Conversación de Tec Bot';

    if (canShare) {
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
    } else {
      // Fallback: copy to clipboard
      const success = await copyToClipboard(content);
      if (success) {
        toast.success('Copiado al portapapeles', {
          description: 'La conversación se copió como texto'
        });
      } else {
        toast.error('Error al copiar', {
          description: 'No se pudo copiar al portapapeles'
        });
      }
    }
  };

  const handleShareAsFile = async (format) => {
    let content, filename, mimeType;

    switch (format) {
      case 'json':
        content = exportAsJSON(messages, metadata);
        filename = generateFilename('conversacion', 'json');
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = exportAsMarkdown(messages, metadata);
        filename = generateFilename('conversacion', 'md');
        mimeType = 'text/markdown';
        break;
      default:
        return;
    }

    // Check if Web Share API with files is supported
    if (canShare && navigator.canShare) {
      try {
        const file = new File([content], filename, { type: mimeType });
        const shareData = {
          files: [file],
          title: metadata.title || 'Conversación de Tec Bot'
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Compartido', {
            description: 'El archivo se compartió correctamente'
          });
          return;
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing file:', error);
        }
      }
    }

    // Fallback: download file
    downloadFile(content, filename, mimeType);
    toast.success('Descargado', {
      description: 'El archivo se descargó correctamente'
    });
  };

  const handleCopyAsText = async () => {
    try {
      const content = exportAsText(messages, metadata);
      const success = await copyToClipboard(content);

      if (success) {
        setCopied(true);
        toast.success('Copiado al portapapeles', {
          description: 'La conversación se copió como texto'
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Failed to copy');
      }
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar al portapapeles'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Compartir conversación</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {canShare && (
          <>
            <DropdownMenuItem onClick={handleShareAsText}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Compartir como texto</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleCopyAsText}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>{copied ? 'Copiado!' : 'Copiar como texto'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleShareAsFile('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Exportar JSON</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShareAsFile('markdown')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exportar Markdown</span>
        </DropdownMenuItem>

        {!canShare && (
          <div className="px-2 py-2 text-xs text-muted-foreground">
            * Tu navegador no soporta compartir archivos
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
