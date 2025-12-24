import { useTranslation } from 'react-i18next';
import useAutosize from '@/hooks/useAutosize';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import sendIcon from '@/assets/images/send.svg';

function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }) {
  const { t } = useTranslation();
  const { isReadOnly } = useReadOnly();
  const textareaRef = useAutosize(newMessage);

  function handleKeyDown(e) {
    if(e.keyCode === 13 && !e.shiftKey && !isLoading && !isReadOnly) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  return(
    <div className='shrink-0 bg-background pb-4'>
      <div className='p-1.5 bg-primary/10 rounded-3xl z-50 font-mono origin-bottom animate-chat duration-400'>
        <div className={`pr-0.5 bg-card relative shrink-0 rounded-3xl overflow-hidden ring-border ring-1 focus-within:ring-2 focus-within:ring-ring transition-all ${isReadOnly ? 'opacity-60' : ''}`}>
          <textarea
            id="chat-input"
            className='block w-full max-h-[140px] py-2 px-4 pr-11 bg-card text-foreground rounded-3xl resize-none placeholder:text-muted-foreground placeholder:leading-4 placeholder:-translate-y-1 sm:placeholder:leading-normal sm:placeholder:translate-y-0 focus:outline-none disabled:cursor-not-allowed'
            ref={textareaRef}
            rows='1'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isReadOnly}
            placeholder={isReadOnly ? t('readOnly.inputPlaceholder') : ''}
          />
          <button
            className='absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={submitNewMessage}
            disabled={isReadOnly}
          >
            <img src={sendIcon} alt='send' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;