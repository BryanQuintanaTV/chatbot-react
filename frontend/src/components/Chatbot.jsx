import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import { ExportConversation } from '@/components/ExportConversation';
import { ImportConversation } from '@/components/ImportConversation';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ShareConversation } from '@/components/ShareConversation';

function Chatbot() {
  const { t } = useTranslation();
  const { activeChat, updateChatMessages, selectedModel } = useChat();
  const VITE_API_URL = import.meta.env.VITE_VERSION;
  const [messages, setMessages] = useImmer(activeChat?.messages || []);
  const [newMessage, setNewMessage] = useState('');

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
            {/* Show Import button on empty chat */}
            <div className='flex justify-end'>
              <ImportConversation onImport={handleImportConversation} />
            </div>
          </div>
        )}

        {/* Toolbar with conversation tools */}
        {messages.length > 0 && (
          <div className='flex flex-wrap gap-2 justify-end mb-4'>
            <AdvancedSearch messages={messages} />
            <ShareConversation
              messages={messages}
              metadata={{
                title: activeChat?.title || 'Conversación Tec Bot',
                model: selectedModel
              }}
            />
            <ExportConversation
              messages={messages}
              metadata={{
                title: activeChat?.title || 'Conversación Tec Bot',
                model: selectedModel
              }}
            />
            <ImportConversation onImport={handleImportConversation} />
          </div>
        )}

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
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