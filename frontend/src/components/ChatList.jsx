import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EditChatDialog } from '@/components/EditChatDialog';
import {
  MessageSquare,
  MessagesSquare,
  FileText,
  ClipboardList,
  BookOpen,
  Target,
  Star,
  Lightbulb,
  Flame,
  Sparkles,
  Palette,
  Book,
  Newspaper,
  GraduationCap,
  Briefcase,
  Home,
  Gamepad2,
  Music,
  Film,
  Dumbbell,
  Brain,
  Heart,
  Code,
  Coffee,
  Rocket,
  MoreVertical,
  Pencil,
  Trash2,
  Pin,
  Archive,
  ArchiveRestore,
  Folder,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// Icon mapping
const ICON_MAP = {
  MessageSquare,
  MessagesSquare,
  FileText,
  ClipboardList,
  BookOpen,
  Target,
  Star,
  Lightbulb,
  Flame,
  Sparkles,
  Palette,
  Book,
  Newspaper,
  GraduationCap,
  Briefcase,
  Home,
  Gamepad2,
  Music,
  Film,
  Dumbbell,
  Brain,
  Heart,
  Code,
  Coffee,
  Rocket,
};

// Helper function to get icon component
const getIconComponent = (iconName) => {
  return ICON_MAP[iconName] || MessageSquare;
};

export function ChatList({ onChatSelect, showArchived = false }) {
  const { t } = useTranslation();
  const { chats, activeChat, createNewChat, switchChat, updateChat, togglePinChat, toggleArchiveChat, deleteChat } = useChat();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const longPressTimerRef = useRef(null);

  const handleChatClick = (chatId) => {
    switchChat(chatId);
    if (onChatSelect) {
      onChatSelect();
    }
  };

  const handleEditClick = (chat, e) => {
    e.stopPropagation();
    setChatToEdit(chat);
    setEditDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditSave = (updates) => {
    if (chatToEdit) {
      updateChat(chatToEdit.id, updates);
      toast.success(t('chat.updateSuccess') || 'Chat actualizado exitosamente');
      setChatToEdit(null);
    }
  };

  const handlePinClick = (chat, e) => {
    e.stopPropagation();
    togglePinChat(chat.id);
    toast.success(chat.pinned ? t('chat.unpinSuccess') || 'Chat despegado' : t('chat.pinSuccess') || 'Chat fijado');
    setOpenDropdownId(null);
  };

  const handleArchiveClick = (chat, e) => {
    e.stopPropagation();
    toggleArchiveChat(chat.id);
    toast.success(chat.archived ? t('chat.unarchiveSuccess') || 'Chat desarchivado' : t('chat.archiveSuccess') || 'Chat archivado');
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (chat, e) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
    setOpenDropdownId(null);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete) {
      const success = deleteChat(chatToDelete.id);
      if (success) {
        toast.success(t('chat.deleteSuccess'));
      } else {
        toast.error(t('chat.deleteError'));
      }
      setChatToDelete(null);
    }
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Long press handlers for mobile
  const handleTouchStart = (chatId, e) => {
    // Clear any existing timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Start long press timer (500ms)
    longPressTimerRef.current = setTimeout(() => {
      e.preventDefault();
      setOpenDropdownId(chatId);
    }, 500);
  };

  const handleTouchEnd = () => {
    // Clear timer if touch ends before long press completes
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return t('common.yesterday');
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter and organize chats
  const organizedChats = useMemo(() => {
    // Filter based on archive status
    const filteredChats = chats.filter(chat =>
      showArchived ? chat.archived : !chat.archived
    );

    // Separate pinned and unpinned
    const pinnedChats = filteredChats.filter(chat => chat.pinned);
    const unpinnedChats = filteredChats.filter(chat => !chat.pinned);

    // Group by category
    const grouped = {};

    unpinnedChats.forEach(chat => {
      let categoryKey = chat.category || 'uncategorized';

      // For backwards compatibility with old Spanish category names
      const legacyMapping = {
        'Trabajo': 'work',
        'Escuela': 'school',
        'Personal': 'personal',
        'Proyectos': 'projects',
        'Ideas': 'ideas',
        'Investigación': 'research',
        'Tareas': 'homework',
      };

      // Map old category to new key if needed
      if (legacyMapping[categoryKey]) {
        categoryKey = legacyMapping[categoryKey];
      }

      // Normalize to uncategorized if empty
      if (!categoryKey || categoryKey === '') {
        categoryKey = 'uncategorized';
      }

      // Translate the category for display
      const categoryDisplay = t(`chat.categories.${categoryKey}`) || t('chat.uncategorized') || categoryKey;

      if (!grouped[categoryDisplay]) {
        grouped[categoryDisplay] = [];
      }
      grouped[categoryDisplay].push(chat);
    });

    return {
      pinned: pinnedChats,
      categories: grouped
    };
  }, [chats, showArchived, t]);

  const renderChat = (chat) => {
    const IconComponent = getIconComponent(chat.icon);

    return (
      <div
        key={chat.id}
        onClick={() => handleChatClick(chat.id)}
        onTouchStart={(e) => handleTouchStart(chat.id, e)}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`group relative flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
          chat.id === activeChat?.id
            ? 'bg-muted'
            : 'hover:bg-muted/50'
        }`}
        style={{ backgroundColor: chat.id === activeChat?.id ? undefined : chat.bgColor }}
      >
        {/* Chat Icon */}
        <div className="shrink-0">
          <IconComponent className="h-5 w-5" style={{ color: chat.color }} />
        </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate font-medium"
          style={{ color: chat.color }}
        >
          {chat.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(chat.updatedAt)}
        </p>
      </div>

      {/* Pin indicator */}
      {chat.pinned && (
        <Pin className="h-3 w-3 text-muted-foreground shrink-0" />
      )}

      {/* Chat Options */}
      <DropdownMenu open={openDropdownId === chat.id} onOpenChange={(open) => setOpenDropdownId(open ? chat.id : null)}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => handleEditClick(chat, e)} className="cursor-pointer">
            <Pencil className="h-4 w-4 mr-2" />
            {t('chat.edit') || 'Editar'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handlePinClick(chat, e)} className="cursor-pointer">
            <Pin className="h-4 w-4 mr-2" />
            {chat.pinned ? (t('chat.unpin') || 'Despegar') : (t('chat.pin') || 'Fijar')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleArchiveClick(chat, e)} className="cursor-pointer">
            {chat.archived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                {t('chat.unarchive') || 'Desarchivar'}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t('chat.archive') || 'Archivar'}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => handleDeleteClick(chat, e)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('chat.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {/* Pinned Chats */}
          {organizedChats.pinned.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('chat.pinned') || 'Fijados'}
              </div>
              {organizedChats.pinned.map(renderChat)}
            </div>
          )}

          {/* Categorized Chats */}
          {Object.entries(organizedChats.categories).map(([category, categoryChats]) => (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 rounded-md transition-colors"
              >
                {collapsedCategories[category] ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <Folder className="h-3 w-3" />
                <span>{category}</span>
                <span className="ml-auto text-[10px]">({categoryChats.length})</span>
              </button>
              {!collapsedCategories[category] && (
                <div className="mt-1 space-y-1">
                  {categoryChats.map(renderChat)}
                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {organizedChats.pinned.length === 0 && Object.keys(organizedChats.categories).length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <Archive className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {showArchived
                  ? (t('chat.noArchivedChats') || 'No hay chats archivados')
                  : (t('chat.noChats') || 'No hay chats')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Chat Dialog */}
      <EditChatDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        chat={chatToEdit}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteChat}
        title={t('chat.deleteChat') || t('chat.delete')}
        description={chatToDelete ? t('chat.deleteConfirm', { title: chatToDelete.title }) : ''}
        confirmText={t('common.delete') || t('chat.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </>
  );
}
