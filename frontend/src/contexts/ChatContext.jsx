import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => {
    // Load chats from localStorage
    const saved = localStorage.getItem('chatbot-conversations');
    if (saved) {
      return JSON.parse(saved);
    }
    // Create default first chat
    return [
      {
        id: Date.now().toString(),
        title: 'Nueva Conversación',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: '💬',
        color: '#8B5CF6', // Purple
        category: null,
        pinned: false,
        archived: false,
        bgColor: null,
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem('chatbot-active-chat');
    return saved || chats[0]?.id;
  });

  // Save to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('chatbot-conversations', JSON.stringify(chats));
  }, [chats]);

  // Save active chat ID
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('chatbot-active-chat', activeChatId);
    }
  }, [activeChatId]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Nueva Conversación',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: '💬',
      color: '#8B5CF6', // Purple
      category: null,
      pinned: false,
      archived: false,
      bgColor: null,
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const switchChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const updateChatMessages = (chatId, messages) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          // Auto-generate title from first user message if still default
          let newTitle = chat.title;
          if (
            chat.title === 'Nueva Conversación' &&
            messages.length > 0 &&
            messages[0].role === 'user'
          ) {
            // Take first 50 characters of first message as title
            newTitle = messages[0].content.slice(0, 50);
            if (messages[0].content.length > 50) {
              newTitle += '...';
            }
          }

          return {
            ...chat,
            messages,
            title: newTitle,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      })
    );
  };

  const renameChat = (chatId, newTitle) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, title: newTitle, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const updateChat = (chatId, updates) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const togglePinChat = (chatId) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, pinned: !chat.pinned, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const toggleArchiveChat = (chatId) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, archived: !chat.archived, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const deleteChat = (chatId) => {
    // Don't allow deleting the last chat
    if (chats.length === 1) {
      return false;
    }

    setChats((prevChats) => {
      const filtered = prevChats.filter((chat) => chat.id !== chatId);

      // If we're deleting the active chat, switch to the first available chat
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0].id);
      }

      return filtered;
    });
    return true;
  };

  const clearChatMessages = (chatId) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [],
              title: 'Nueva Conversación',
              updatedAt: new Date().toISOString(),
            }
          : chat
      )
    );
  };

  const value = {
    chats,
    activeChat,
    activeChatId,
    createNewChat,
    switchChat,
    updateChatMessages,
    renameChat,
    updateChat,
    togglePinChat,
    toggleArchiveChat,
    deleteChat,
    clearChatMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
