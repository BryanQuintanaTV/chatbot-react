import { useState, useEffect, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import useAutoScroll from '@/hooks/useAutoScroll';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { notify } from '@/lib/notify';

function Chatbot({ headerActions }) {
  const { t } = useTranslation();
  const { activeChat, updateChatMessages, selectedModel } = useChat();
  const { token } = useAuth();
  const VITE_API_URL = import.meta.env.VITE_VERSION;
  const [messages, setMessages] = useImmer(activeChat?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [highlightedMessageIndex, setHighlightedMessageIndex] = useState(null);

  // Sync messages when active chat changes or messages are cleared
  useEffect(() => {
    setMessages(activeChat?.messages || []);
  }, [activeChat?.id, activeChat?.messages.length, setMessages]);

  // Update chat context when messages change
  useEffect(() => {
    if (activeChat && activeChat.id) {
      updateChatMessages(activeChat.id, messages);
    }
  }, [messages]);

  const isLoading = messages.length && messages[messages.length - 1].loading;
  const { scrollContentRef, scrollToBottom, showScrollButton } = useAutoScroll();

  async function submitNewMessage(retryContent) {
    const trimmedMessage = retryContent || newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const now = Date.now();

    setMessages(draft => [...draft,
      { role: 'user', content: trimmedMessage, timestamp: now },
      { role: 'assistant', content: '', sources: [], loading: true, modelUsed: null, timestamp: now }
    ]);
    if (!retryContent) setNewMessage('');
    scrollToBottom();

    const conversationId = activeChat?.id;

    try {
      const { stream, modelUsed } = await api.sendChatMessage(
        conversationId,
        trimmedMessage,
        selectedModel,
        token
      );

      setMessages(draft => {
        draft[draft.length - 1].modelUsed = modelUsed;
      });

      for await (const textChunk of parseSSEStream(stream)) {
        setMessages(draft => {
          draft[draft.length - 1].content += textChunk;
        });
      }
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
      notify.error({ title: t('chat.error'), description: t('chat.errorDescription') || err.message });
    }
  }

  // Retry: remove failed pair and re-send the user message
  const handleRetry = useCallback(() => {
    if (messages.length < 2) return;
    const lastUserMsg = messages[messages.length - 2];
    if (lastUserMsg?.role !== 'user') return;

    const userContent = lastUserMsg.content;
    setMessages(draft => {
      draft.splice(draft.length - 2, 2);
    });
    setTimeout(() => submitNewMessage(userContent), 0);
  }, [messages, setMessages]);

  const handleImportConversation = (conversationData) => {
    setMessages(conversationData.messages);
  };

  const handleMessageClick = (messageIndex) => {
    setHighlightedMessageIndex(messageIndex);

    setTimeout(() => {
      const messageElement = document.querySelector(`[data-message-index="${messageIndex}"]`);
      if (messageElement) {
        const scrollContainer = messageElement.closest('.overflow-y-auto');
        if (scrollContainer) {
          const elementTop = messageElement.offsetTop;
          const containerHeight = scrollContainer.clientHeight;
          const elementHeight = messageElement.clientHeight;
          const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
          scrollContainer.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        } else {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    setTimeout(() => {
      setHighlightedMessageIndex(null);
    }, 1500);
  };

  // Expose data to parent so the header can render action buttons
  if (headerActions) {
    headerActions.current = {
      messages,
      handleImportConversation,
      handleMessageClick,
    };
  }

  return (
    <div className='flex flex-col flex-1 overflow-hidden relative'>
      <div className='flex-1 overflow-y-auto pt-4 pb-4 px-4'>
        <div
          className="max-w-3xl transition-[margin] duration-300 ease-in-out"
          style={{ marginLeft: 'max(0px, calc(50vw - var(--sidebar-width, 0px) - 384px))', marginRight: 'auto' }}
        >
          {messages.length === 0 && (
            <div className='px-2 md:px-10'>
              <div className='mt-3 font-urbanist text-muted-foreground text-xl font-light space-y-2'>
                <p>👋 {t('chat.welcome')}</p>
                <p>{t('chat.welcomeDescription')}</p>
                <p><small>{t('chat.datasetVersion')}</small></p>
              </div>
            </div>
          )}

          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            highlightedMessageIndex={highlightedMessageIndex}
            scrollContentRef={scrollContentRef}
            onRetry={handleRetry}
          />
        </div>
      </div>

      {/* Scroll-to-bottom floating button */}
      {showScrollButton && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 animate-message-enter">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full shadow-lg border"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
}

export default Chatbot;
