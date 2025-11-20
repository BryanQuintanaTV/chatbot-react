import { Download, FileJson, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  if (!messages || messages.length === 0) {
    return null;
  }

  const handleExportJSON = () => {
    try {
      const content = exportAsJSON(messages, metadata);
      const filename = generateFilename('conversacion', 'json');
      downloadFile(content, filename, 'application/json');
      toast.success('Conversación exportada', {
        description: 'Se descargó el archivo JSON correctamente'
      });
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo exportar la conversación'
      });
    }
  };

  const handleExportMarkdown = () => {
    try {
      const content = exportAsMarkdown(messages, metadata);
      const filename = generateFilename('conversacion', 'md');
      downloadFile(content, filename, 'text/markdown');
      toast.success('Conversación exportada', {
        description: 'Se descargó el archivo Markdown correctamente'
      });
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo exportar la conversación'
      });
    }
  };

  const handleExportText = () => {
    try {
      const content = exportAsText(messages, metadata);
      const filename = generateFilename('conversacion', 'txt');
      downloadFile(content, filename, 'text/plain');
      toast.success('Conversación exportada', {
        description: 'Se descargó el archivo de texto correctamente'
      });
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo exportar la conversación'
      });
    }
  };

  const handleCopyToClipboard = async () => {
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
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar conversación</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Formato JSON</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Formato Markdown</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportText}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Texto plano</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyToClipboard}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>{copied ? 'Copiado!' : 'Copiar al portapapeles'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
