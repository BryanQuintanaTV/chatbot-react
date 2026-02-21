import { createContext, useContext, useState, useEffect } from 'react';
import { ModelChangeWarning } from '@/components/ModelChangeWarning';
import { conversationsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ChatContext = createContext();

// Normalize bgColor: only accept the current rgba(r,g,b,0.1) format.
// Old data may have stored opaque hex/rgb values (e.g. #DBEAFE) — reset those to null.
const normalizeBgColor = (bgColor) => {
  if (!bgColor) return null;
  return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\.1\s*\)$/.test(bgColor) ? bgColor : null;
};

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
        bgColor: normalizeBgColor(chat.bgColor), // Normalize old opaque bgColor values
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

  // Save to localStorage ONLY for unauthenticated users with LOCAL chats
  useEffect(() => {
    if (!isAuthenticated) {
      // Only save chats that are local (not from backend)
      const localChats = chats.filter(chat => chat.isLocal !== false);
      localStorage.setItem('chatbot-conversations', JSON.stringify(localChats));
    }
  }, [chats, isAuthenticated]);

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

  // Load conversations from backend when user logs in, clear when user logs out
  useEffect(() => {
    if (isAuthenticated && token) {
      // Clear localStorage for authenticated users - backend is source of truth
      localStorage.removeItem('chatbot-conversations');
      localStorage.removeItem('chatbot-active-chat');

      // Load conversations from backend
      conversationsAPI.getAll(token)
        .then(async backendChatsResponse => {
          console.log('Backend chats response:', backendChatsResponse);

          // Handle nested response format: {conversations: [...]} or direct array
          let backendChats = backendChatsResponse;
          if (backendChatsResponse && backendChatsResponse.conversations) {
            backendChats = backendChatsResponse.conversations;
          }

          if (backendChats && backendChats.length > 0) {
            // Load full conversation details (with messages) for each conversation in parallel
            // GET /api/conversations returns metadata only
            // GET /api/conversations/{id} returns full conversation with messages
            const conversationPromises = backendChats.map(chat =>
              conversationsAPI.getById(token, chat.id)
                .then(fullChat => {
                  console.log(`Loaded full conversation ${chat.id}:`, fullChat);

                  // Handle nested response format
                  let conversationData = fullChat;
                  if (fullChat && fullChat.conversation) {
                    conversationData = fullChat.conversation;
                  }

                  return conversationData;
                })
                .catch(error => {
                  console.error(`Error loading conversation ${chat.id}:`, error);
                  // Return metadata only if we can't fetch full conversation
                  return chat;
                })
            );

            // Wait for all conversations to be loaded
            const fullConversations = await Promise.all(conversationPromises);

            // Map backend conversations to frontend format
            // Backend uses camelCase for all fields
            const formattedChats = fullConversations.map(chat => {
              // Skip chats without valid IDs
              if (!chat.id) {
                console.error('Skipping chat without ID:', chat);
                return null;
              }

              const formattedChat = {
                id: String(chat.id), // Ensure ID is a string
                title: chat.title || 'Nueva Conversación',
                messages: Array.isArray(chat.messages) ? chat.messages : [],
                createdAt: chat.createdAt || new Date().toISOString(),
                updatedAt: chat.updatedAt || new Date().toISOString(),
                icon: chat.icon || 'MessageSquare',
                color: chat.color || '#8B5CF6',
                category: chat.category || 'uncategorized',
                pinned: chat.pinned === true,
                archived: chat.archived === true,
                bgColor: normalizeBgColor(chat.bgColor),
                modelUsed: chat.modelUsed || 'auto',
                messageCount: chat.messageCount || 0,
                isLocal: false, // Backend chats can sync
              };

              console.log('Formatted chat:', formattedChat);
              return formattedChat;
            }).filter(chat => chat !== null); // Remove any chats that were skipped

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
      // When user logs out, IMMEDIATELY clear backend conversations from state
      // This prevents the race condition where backend chats get saved to localStorage
      setChats([]); // Clear state first

      // Then load local conversations or create default
      const saved = localStorage.getItem('chatbot-conversations');
      if (saved) {
        try {
          const parsedChats = JSON.parse(saved);
          // Filter out any backend chats that might have been saved incorrectly
          const localChats = parsedChats.filter(chat => chat.isLocal !== false);
          if (localChats.length > 0) {
            setChats(localChats.map(chat => ({
              ...chat,
              modelUsed: chat.modelUsed || 'pytorch',
              isLocal: true, // Ensure marked as local
            })));
            setActiveChatId(localChats[0].id);
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage chats:', error);
        }
      }

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
        isLocal: true, // Local chat for unauthenticated users
      };
      setChats([defaultChat]);
      setActiveChatId(defaultChat.id);
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
        const backendChatResponse = await conversationsAPI.create(token, newChatData);
        console.log('Backend chat response:', backendChatResponse);

        // Handle nested response format: {conversation: {...}} or direct object
        let backendChat = backendChatResponse;
        if (backendChatResponse && backendChatResponse.conversation) {
          backendChat = backendChatResponse.conversation;
        }

        // Validate backend response has an ID
        if (!backendChat || !backendChat.id) {
          console.error('Backend did not return a valid chat with ID:', backendChat);
          throw new Error('Backend did not return a valid chat ID');
        }

        // Backend uses camelCase for all fields
        const newChat = {
          id: String(backendChat.id), // Ensure ID is a string
          title: backendChat.title || 'Nueva Conversación',
          messages: [], // New chats don't have messages yet
          createdAt: backendChat.createdAt || new Date().toISOString(),
          updatedAt: backendChat.updatedAt || new Date().toISOString(),
          icon: backendChat.icon || 'MessageSquare',
          color: backendChat.color || '#8B5CF6',
          category: backendChat.category || 'uncategorized',
          pinned: backendChat.pinned === true,
          archived: backendChat.archived === true,
          bgColor: normalizeBgColor(backendChat.bgColor),
          modelUsed: backendChat.modelUsed || selectedModel,
          messageCount: 0,
          isLocal: false, // Backend chat - can sync
        };

        console.log('New chat formatted:', newChat);
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
      isLocal: true, // Local chat - don't sync to backend
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
    // Validate chatId exists
    if (!chatId) {
      console.error('updateChatMessages called with undefined chatId');
      return;
    }

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
    console.log('updateChat called:', { chatId, updates });

    // Validate chatId exists
    if (!chatId) {
      console.error('updateChat called with undefined chatId');
      return;
    }

    // Check if chat is local (created with timestamp ID when backend failed)
    const chat = chats.find(c => c.id === chatId);
    const isLocalChat = chat?.isLocal || false;

    console.log('updateChat validation:', {
      chatId,
      chatFound: !!chat,
      isLocalChat,
      isAuthenticated,
      hasToken: !!token,
      willSyncToBackend: isAuthenticated && token && !isLocalChat && chatId
    });

    // Update locally first for immediate UI feedback
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: new Date().toISOString() }
          : chat
      )
    );

    // Only sync to backend if user is authenticated AND chat is not local AND chatId is valid
    if (isAuthenticated && token && !isLocalChat && chatId) {
      try {
        // Backend uses camelCase, send directly
        const backendUpdates = {
          title: updates.title,
          icon: updates.icon,
          color: updates.color,
          category: updates.category,
          pinned: updates.pinned,
          archived: updates.archived,
          bgColor: updates.bgColor,
          modelUsed: updates.modelUsed,
        };
        // Remove undefined fields
        Object.keys(backendUpdates).forEach(key =>
          backendUpdates[key] === undefined && delete backendUpdates[key]
        );

        console.log('Calling backend API to update chat:', { chatId, backendUpdates });
        const response = await conversationsAPI.update(token, chatId, backendUpdates);
        console.log('Backend update response:', response);
      } catch (error) {
        console.error('Error updating chat in backend:', error);
        // UI already updated, so just log the error
      }
    } else {
      console.log('Skipping backend sync:', {
        reason: !isAuthenticated ? 'not authenticated' :
                !token ? 'no token' :
                isLocalChat ? 'local chat' :
                !chatId ? 'no chatId' : 'unknown'
      });
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
    // Validate chatId exists
    if (!chatId) {
      console.error('deleteChat called with undefined chatId');
      return false;
    }

    // Don't allow deleting the last chat
    if (chats.length === 1) {
      return false;
    }

    // Check if chat is local
    const chat = chats.find(c => c.id === chatId);
    const isLocalChat = chat?.isLocal || false;

    // Delete locally first
    setChats((prevChats) => {
      const filtered = prevChats.filter((chat) => chat.id !== chatId);

      // If we're deleting the active chat, switch to the first available chat
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0].id);
      }

      return filtered;
    });

    // Only delete from backend if authenticated AND chat is not local AND chatId is valid
    if (isAuthenticated && token && !isLocalChat && chatId) {
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
    // Validate chatId exists
    if (!chatId) {
      console.error('clearChatMessages called with undefined chatId');
      return;
    }

    // Check if chat is local
    const chat = chats.find(c => c.id === chatId);
    const isLocalChat = chat?.isLocal || false;

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

    // Only clear in backend if authenticated AND chat is not local AND chatId is valid
    if (isAuthenticated && token && !isLocalChat && chatId) {
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
