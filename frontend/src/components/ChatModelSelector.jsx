/**
 * ChatModelSelector
 *
 * A compact model-selector displayed inside the chat area (below the header).
 * It reflects and controls the `modelUsed` field of the active chat,
 * instead of the global `selectedModel` from Settings.
 *
 * - Hidden when the user is unauthenticated (pytorch only for guests).
 * - Disabled when the admin has restricted model changes for this user.
 * - Shows a tooltip on restricted state.
 */

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useModels } from '@/hooks/useModels';
import { Cpu } from 'lucide-react';

export function ChatModelSelector() {
  const { t } = useTranslation();
  const { activeChat, setModelForChat } = useChat();
  const { isAuthenticated, restrictions } = useAuth();
  const { models, loading: modelsLoading } = useModels();

  // Unauthenticated users are locked to pytorch
  if (!isAuthenticated) return null;

  const currentModel = activeChat?.modelUsed || 'auto';
  const canChange = restrictions?.canChangeModel !== false;

  const handleChange = (newModel) => {
    if (!canChange || !activeChat?.id) return;
    setModelForChat(activeChat.id, newModel);
  };

  const selector = (
    <div className="flex items-center gap-1.5">
      <Cpu className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Select
        value={currentModel}
        onValueChange={handleChange}
        disabled={modelsLoading || !canChange}
      >
        <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none px-1 gap-1 focus:ring-0 focus:ring-offset-0 text-muted-foreground hover:text-foreground transition-colors min-w-0 w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {models.map((model) => {
            const requiresAuth = model.id !== 'pytorch';
            const isDisabled = !model.available || (!isAuthenticated && requiresAuth);
            return (
              <SelectItem key={model.id} value={model.id} disabled={isDisabled}>
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  {model.recommended && <span className="text-xs">⭐</span>}
                  {!model.available && (
                    <span className="text-xs text-muted-foreground">
                      ({t('models.unavailable')})
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  if (!canChange) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{selector}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('restrictions.cannotChangeModel')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return selector;
}
