import { createContext, useContext, useState, useEffect } from 'react';
import { ModelChangeWarning } from '@/components/ModelChangeWarning';
import { conversationsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [chats, setChats] = useState(() => {
    // Load chats from localStorage
    const saved = localStorage.getItem('chatbot-conversations');
    if (saved) {
      const parsedChats = JSON.parse(saved);
      // Migrate old chats to add modelUsed field
      return parsedChats.map(chat => ({
        ...chat,
        modelUsed: chat.modelUsed || 'auto', // Default to 'auto' for old chats
      }));
    }
    // Create default first chat
    return [
      {
        id: Date.now().toString(),
        title: 'Nueva Conversación',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: 'MessageSquare',
        color: '#8B5CF6', // Purple
        category: 'uncategorized',
        pinned: false,
        archived: false,
        bgColor: null,
        modelUsed: 'auto', // Default model
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem('chatbot-active-chat');
    return saved || chats[0]?.id;
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('chatbot-selected-model');
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    // If not authenticated, force pytorch model
    if (!token) {
      return 'pytorch';
    }
    return saved || 'auto'; // Default to 'auto'
  });

  const [pendingModelChange, setPendingModelChange] = useState(null);
  const [showModelWarning, setShowModelWarning] = useState(false);

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

  // Save selected model
  useEffect(() => {
    localStorage.setItem('chatbot-selected-model', selectedModel);
  }, [selectedModel]);

  // Force pytorch model for unauthenticated users
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token && selectedModel !== 'pytorch') {
        setSelectedModel('pytorch');
      }
    };

    // Check on mount and when storage changes
    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [selectedModel]);

  // Load conversations from backend when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      // Load conversations from backend
      conversationsAPI.getAll(token)
        .then(backendChats => {
          if (backendChats && backendChats.length > 0) {
            // Map backend conversations to frontend format
            const formattedChats = backendChats.map(chat => ({
              id: chat.id,
              title: chat.title || 'Nueva Conversación',
              messages: chat.messages || [],
              createdAt: chat.created_at || chat.createdAt,
              updatedAt: chat.updated_at || chat.updatedAt,
              icon: chat.icon || 'MessageSquare',
              color: chat.color || '#8B5CF6',
              category: chat.category || 'uncategorized',
              pinned: chat.pinned || false,
              archived: chat.archived || false,
              bgColor: chat.bg_color || chat.bgColor || null,
              modelUsed: chat.model_used || chat.modelUsed || 'auto',
            }));
            setChats(formattedChats);
            // Set first chat as active if there's no active chat
            if (!activeChatId || !formattedChats.find(c => c.id === activeChatId)) {
              setActiveChatId(formattedChats[0].id);
            }
          }
        })
        .catch(error => {
          console.error('Error loading conversations from backend:', error);
          // If error, keep using localStorage conversations
        });
    } else if (!isAuthenticated) {
      // When user logs out, clear backend conversations and use default
      const saved = localStorage.getItem('chatbot-conversations');
      if (saved) {
        const parsedChats = JSON.parse(saved);
        setChats(parsedChats.map(chat => ({
          ...chat,
          modelUsed: chat.modelUsed || 'auto',
        })));
      } else {
        // Create default chat for unauthenticated users
        const defaultChat = {
          id: Date.now().toString(),
          title: 'Nueva Conversación',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          icon: 'MessageSquare',
          color: '#8B5CF6',
          category: 'uncategorized',
          pinned: false,
          archived: false,
          bgColor: null,
          modelUsed: 'pytorch',
        };
        setChats([defaultChat]);
        setActiveChatId(defaultChat.id);
      }
    }
  }, [isAuthenticated, token]); // Only run when auth status changes

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const createNewChat = async () => {
    const newChatData = {
      title: 'Nueva Conversación',
      icon: 'MessageSquare',
      color: '#8B5CF6', // Purple
      category: 'uncategorized',
      bgColor: null,
    };

    // If user is authenticated, create in backend
    if (isAuthenticated && token) {
      try {
        const backendChat = await conversationsAPI.create(token, newChatData);
        const newChat = {
          id: backendChat.id,
          title: backendChat.title,
          messages: backendChat.messages || [],
          createdAt: backendChat.created_at || backendChat.createdAt,
          updatedAt: backendChat.updated_at || backendChat.updatedAt,
          icon: backendChat.icon || 'MessageSquare',
          color: backendChat.color || '#8B5CF6',
          category: backendChat.category || 'uncategorized',
          pinned: backendChat.pinned || false,
          archived: backendChat.archived || false,
          bgColor: backendChat.bg_color || backendChat.bgColor || null,
          modelUsed: backendChat.model_used || backendChat.modelUsed || selectedModel,
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
        return newChat;
      } catch (error) {
        console.error('Error creating chat in backend:', error);
        // Fall through to create locally
      }
    }

    // For unauthenticated users or if backend fails, create locally
    const newChat = {
      id: Date.now().toString(),
      ...newChatData,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      archived: false,
      modelUsed: selectedModel,
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const switchChat = (chatId) => {
    const targetChat = chats.find(chat => chat.id === chatId);

    // Check if chat has messages and uses a different model
    if (targetChat && targetChat.messages && targetChat.messages.length > 0) {
      const chatModel = targetChat.modelUsed || 'auto';

      // If there's a model discrepancy, show warning
      if (chatModel !== selectedModel) {
        setPendingModelChange({
          from: chatModel,
          to: selectedModel,
          chatId: chatId
        });
        setShowModelWarning(true);
        return; // Don't switch yet, wait for user confirmation
      }
    }

    // No discrepancy or no messages, switch normally
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

  const updateChat = async (chatId, updates) => {
    // Update locally first for immediate UI feedback
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: new Date().toISOString() }
          : chat
      )
    );

    // If user is authenticated, update in backend
    if (isAuthenticated && token) {
      try {
        // Convert camelCase to snake_case for backend
        const backendUpdates = {
          title: updates.title,
          icon: updates.icon,
          color: updates.color,
          category: updates.category,
          pinned: updates.pinned,
          archived: updates.archived,
          bg_color: updates.bgColor,
          model_used: updates.modelUsed,
        };
        // Remove undefined fields
        Object.keys(backendUpdates).forEach(key =>
          backendUpdates[key] === undefined && delete backendUpdates[key]
        );

        await conversationsAPI.update(token, chatId, backendUpdates);
      } catch (error) {
        console.error('Error updating chat in backend:', error);
        // UI already updated, so just log the error
      }
    }
  };

  const togglePinChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      updateChat(chatId, { pinned: !chat.pinned });
    }
  };

  const toggleArchiveChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      updateChat(chatId, { archived: !chat.archived });
    }
  };

  const deleteChat = async (chatId) => {
    // Don't allow deleting the last chat
    if (chats.length === 1) {
      return false;
    }

    // Delete locally first
    setChats((prevChats) => {
      const filtered = prevChats.filter((chat) => chat.id !== chatId);

      // If we're deleting the active chat, switch to the first available chat
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0].id);
      }

      return filtered;
    });

    // If user is authenticated, delete from backend
    if (isAuthenticated && token) {
      try {
        await conversationsAPI.delete(token, chatId);
      } catch (error) {
        console.error('Error deleting chat from backend:', error);
        // Chat already deleted locally
      }
    }

    return true;
  };

  const clearChatMessages = async (chatId) => {
    // Clear locally first
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

    // If user is authenticated, clear in backend
    if (isAuthenticated && token) {
      try {
        await conversationsAPI.clearMessages(token, chatId);
      } catch (error) {
        console.error('Error clearing messages in backend:', error);
        // Messages already cleared locally
      }
    }
  };

  // Handle global model change from settings
  const handleModelChange = (newModel) => {
    setSelectedModel(newModel);
  };

  // Confirm model change when switching to a chat with different model
  const confirmModelChange = () => {
    if (pendingModelChange) {
      const { chatId, to } = pendingModelChange;

      // Update the chat's modelUsed to the currently selected model
      updateChat(chatId, { modelUsed: to });

      // Now switch to the chat
      setActiveChatId(chatId);

      setPendingModelChange(null);
    }
  };

  // Cancel model change - switch model to match chat's model, then switch to chat
  const cancelModelChange = () => {
    if (pendingModelChange) {
      const { chatId, from } = pendingModelChange;

      // Change the selected model to match the chat's model
      setSelectedModel(from);

      // Now switch to the chat
      setActiveChatId(chatId);

      setPendingModelChange(null);
    }
  };

  const value = {
    chats,
    activeChat,
    activeChatId,
    selectedModel,
    setSelectedModel: handleModelChange, // Use the wrapper that shows warnings
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

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ModelChangeWarning
        open={showModelWarning}
        onOpenChange={setShowModelWarning}
        fromModel={pendingModelChange?.from || 'auto'}
        toModel={pendingModelChange?.to || 'auto'}
        onConfirm={confirmModelChange}
        onCancel={cancelModelChange}
      />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
