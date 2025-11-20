import { Download, Upload, FileJson, FileText, Copy, Check, File } from 'lucide-react';
import { useState, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  exportAsJSON,
  exportAsMarkdown,
  exportAsText,
  downloadFile,
  copyToClipboard,
  generateFilename
} from '@/lib/exportConversation';
import { processImportedConversation } from '@/lib/importConversation';

export function ConversationActions({ messages = [], metadata = {}, onImport }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const hasMessages = messages && messages.length > 0;

  // Export handlers
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

  // Import handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setError(null);

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.json')) {
      setError(t('import.invalidFileType'));
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('import.fileTooLarge'));
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const conversationData = await processImportedConversation(file);

      if (onImport) {
        onImport(conversationData);
      }

      setSuccess(true);
      toast.success(t('import.success'), {
        description: t('import.successDescription', { count: conversationData.messages.length })
      });

      setTimeout(() => {
        setImportDialogOpen(false);
        resetImportState();
      }, 1500);
    } catch (err) {
      const errorKey = err.message || 'import.processingError';
      setError(t(errorKey));
      toast.error(t('import.error'), {
        description: t(errorKey)
      });
    } finally {
      setLoading(false);
    }
  };

  const resetImportState = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportDialogChange = (open) => {
    setImportDialogOpen(open);
    if (!open) {
      resetImportState();
    }
  };

  return (
    <>
      {!hasMessages ? (
        // Show simple Import button when no messages
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportDialogOpen(true)}
          className="bg-background dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('import.button')}
        </Button>
      ) : (
        // Show Export dropdown when there are messages
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-background dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
            >
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
      )}

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={handleImportDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('import.title')}</DialogTitle>
            <DialogDescription>
              {t('import.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8
                transition-colors duration-200
                ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${file ? 'bg-muted/50' : 'hover:border-primary/50'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {file ? (
                  <>
                    <FileJson className="h-12 w-12 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {t('import.dragDrop')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('import.or')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {t('import.importedSuccess')}
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {t('import.infoOnlyJSON')}</p>
              <p>• {t('import.infoFormat')}</p>
              <p>• {t('import.infoIDs')}</p>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              disabled={loading}
            >
              {t('import.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || loading || success}
            >
              {loading ? t('import.importing') : t('import.button')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
