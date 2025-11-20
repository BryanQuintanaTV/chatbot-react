import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import { ConversationActions } from '@/components/ConversationActions';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ShareConversation } from '@/components/ShareConversation';

function Chatbot() {
  const { t } = useTranslation();
  const { activeChat, updateChatMessages, selectedModel } = useChat();
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
    if (activeChat) {
      updateChatMessages(activeChat.id, messages);
    }
  }, [messages]);

  const isLoading = messages.length && messages[messages.length - 1].loading;

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', sources: [], loading: true, modelUsed: null }
    ]);
    setNewMessage('');

    // let chatIdOrNew = chatId;
    try {
      // if (!chatId) {
      //   const { id } = await api.createChat();
      //   setChatId(id);
      //   chatIdOrNew = id;
      // }

      const { stream, modelUsed } = await api.sendChatMessage(1, trimmedMessage, selectedModel);

      // Store which model was used
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
    }
  }

  const handleImportConversation = (conversationData) => {
    // Replace current messages with imported ones
    setMessages(conversationData.messages);
  };

  const handleMessageClick = (messageIndex) => {
    // Set the highlighted message
    setHighlightedMessageIndex(messageIndex);

    // Scroll to the message
    setTimeout(() => {
      const messageElement = document.querySelector(`[data-message-index="${messageIndex}"]`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedMessageIndex(null);
    }, 3000);
  };

  return (
    <div className='flex flex-col flex-1 overflow-hidden'>
      <div className='flex-1 overflow-y-auto pt-6 pb-4 px-4'>
        {messages.length === 0 && (
          <div className='space-y-4'>
            <div className='mt-3 font-urbanist text-muted-foreground text-xl font-light space-y-2'>
              <p>👋 {t('chat.welcome')}</p>
              <p>{t('chat.welcomeDescription')}</p>
              <p><small>{t('chat.datasetVersion')}</small></p>
            </div>
            {/* Show ConversationActions (Import) on empty chat */}
            <div className='flex justify-end gap-2'>
              <ConversationActions
                messages={messages}
                metadata={{
                  title: activeChat?.title || 'Conversación Tec Bot',
                  model: selectedModel
                }}
                onImport={handleImportConversation}
              />
            </div>
          </div>
        )}

        {/* Toolbar with conversation tools */}
        {messages.length > 0 && (
          <div className='flex flex-wrap gap-2 justify-end mb-4'>
            <AdvancedSearch
              messages={messages}
              onMessageClick={handleMessageClick}
            />
            <ShareConversation
              messages={messages}
              metadata={{
                title: activeChat?.title || 'Conversación Tec Bot',
                model: selectedModel
              }}
            />
            <ConversationActions
              messages={messages}
              metadata={{
                title: activeChat?.title || 'Conversación Tec Bot',
                model: selectedModel
              }}
              onImport={handleImportConversation}
            />
          </div>
        )}

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          highlightedMessageIndex={highlightedMessageIndex}
        />
      </div>
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