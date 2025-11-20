import { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processImportedConversation } from '@/lib/importConversation';

export function ImportConversation({ onImport }) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

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
    // Validate file type
    if (!selectedFile.name.endsWith('.json')) {
      setError('Solo se permiten archivos JSON');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 10MB)');
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

      // Call the onImport callback with the processed data
      if (onImport) {
        onImport(conversationData);
      }

      setSuccess(true);
      toast.success('Conversación importada', {
        description: `Se importaron ${conversationData.messages.length} mensajes correctamente`
      });

      // Reset after success
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al importar la conversación');
      toast.error('Error al importar', {
        description: err.message || 'No se pudo importar la conversación'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar conversación</DialogTitle>
          <DialogDescription>
            Arrastra un archivo JSON o selecciona uno para importar una conversación anterior.
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
                      Arrastra un archivo JSON aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionar
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
                Conversación importada correctamente
              </AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Solo archivos JSON (máximo 10MB)</p>
            <p>• El formato debe coincidir con las exportaciones de esta app</p>
            <p>• Los IDs se regenerarán automáticamente</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!file || loading || success}
          >
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
