import { useTranslation } from 'react-i18next';
import useAutosize from '@/hooks/useAutosize';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

/**
 * ChatInput — prompt-kit style rounded input with auto-resize.
 */
function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }) {
  const { t } = useTranslation();
  const { isReadOnly } = useReadOnly();
  const textareaRef = useAutosize(newMessage);

  function handleKeyDown(e) {
    if (e.keyCode === 13 && !e.shiftKey && !isLoading && !isReadOnly) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  const canSend = newMessage.trim().length > 0 && !isLoading && !isReadOnly;

  return (
    <div className="shrink-0 bg-background px-4 pb-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={`border-input bg-card relative rounded-3xl border shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring ${isReadOnly ? 'opacity-60' : ''}`}
        >
          <textarea
            id="chat-input"
            className="block w-full max-h-[160px] py-3 px-5 pr-14 bg-transparent text-foreground rounded-3xl resize-none placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
            ref={textareaRef}
            rows="1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isReadOnly}
            placeholder={isReadOnly ? t('readOnly.inputPlaceholder') : t('chat.inputPlaceholder')}
          />
          <Button
            size="icon"
            className={`absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity ${canSend ? 'opacity-100' : 'opacity-40'}`}
            onClick={submitNewMessage}
            disabled={!canSend}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
