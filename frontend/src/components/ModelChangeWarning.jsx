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

  const getWarningContent = () => {
    if (isUpgrade) {
      return {
        icon: <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />,
        title: '🎉 Cambiar este Chat a Modelo Inteligente',
        description: (
          <div className="space-y-3 text-left">
            <p className="font-medium text-foreground">
              Este chat fue creado con <strong>Chatbot Básico</strong>, pero tienes seleccionado <strong>Agente Inteligente</strong>.
            </p>
            <p className="font-medium text-foreground">
              Si cambias este chat al modelo inteligente, obtendrás:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Memoria de conversación:</strong> El chatbot recordará todo el contexto de la conversación actual</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Respuestas más rápidas:</strong> Tiempos de respuesta mejorados</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Mejor comprensión:</strong> Entiende contextos complejos y preguntas de seguimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Multilingüe:</strong> Responde en español e inglés</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Los mensajes anteriores se mantienen. Las nuevas respuestas en este chat usarán el modelo inteligente.
            </p>
          </div>
        ),
        confirmText: 'Sí, cambiar este chat',
        cancelText: 'No, usar modelo del chat',
      };
    }

    if (isDowngrade) {
      return {
        icon: <MessageSquare className="h-12 w-12 text-orange-500 mx-auto mb-4" />,
        title: '⚠️ Cambiar este Chat a Modelo Básico',
        description: (
          <div className="space-y-3 text-left">
            <p className="font-medium text-foreground">
              Este chat fue creado con <strong>Agente Inteligente</strong>, pero tienes seleccionado <strong>Chatbot Básico</strong>.
            </p>
            <p className="font-medium text-foreground">
              Si cambias este chat al modelo básico, tendrás estas limitaciones:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>Sin memoria:</strong> Cada mensaje se procesa de forma independiente, sin recordar mensajes anteriores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>Solo español:</strong> No responde en otros idiomas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>Respuestas más lentas:</strong> Procesamiento local puede tardar más</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span><strong>Contexto limitado:</strong> Mejor para preguntas simples y directas</span>
              </li>
            </ul>
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Recomendación:</strong> El modelo básico es ideal para consultas específicas sobre el TECNM, pero no es óptimo para conversaciones largas. Los mensajes anteriores se mantienen.
              </p>
            </div>
          </div>
        ),
        confirmText: 'Sí, cambiar este chat',
        cancelText: 'No, usar modelo del chat',
      };
    }

    // Default case (shouldn't happen)
    return {
      icon: <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
      title: 'Cambio de Modelo',
      description: 'Estás a punto de cambiar el modelo de IA para esta conversación.',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
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
