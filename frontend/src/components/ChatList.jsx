import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function ChatList({ onChatSelect }) {
  const { t } = useTranslation();
  const { chats, activeChat, createNewChat, switchChat, renameChat, deleteChat } = useChat();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleNewChat = () => {
    createNewChat();
    if (onChatSelect) {
      onChatSelect();
    }
  };

  const handleChatClick = (chatId) => {
    switchChat(chatId);
    if (onChatSelect) {
      onChatSelect();
    }
  };

  const handleRenameClick = (chat, e) => {
    e.stopPropagation();
    setChatToRename(chat);
    setNewTitle(chat.title);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (chatToRename && newTitle.trim()) {
      renameChat(chatToRename.id, newTitle.trim());
      toast.success(t('chat.renameSuccess'));
      setRenameDialogOpen(false);
      setChatToRename(null);
      setNewTitle('');
    }
  };

  const handleDeleteClick = (chat, e) => {
    e.stopPropagation();
    if (window.confirm(t('chat.deleteConfirm', { title: chat.title }))) {
      const success = deleteChat(chat.id);
      if (success) {
        toast.success(t('chat.deleteSuccess'));
      } else {
        toast.error(t('chat.deleteError'));
      }
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

  return (
    <>
      <div className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="px-2 mb-2">
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('chat.newChat')}
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`group relative flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                chat.id === activeChat?.id
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(chat.updatedAt)}
                </p>
              </div>

              {/* Chat Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleRenameClick(chat, e)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('chat.rename')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => handleDeleteClick(chat, e)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('chat.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('chat.renameChat')}</DialogTitle>
            <DialogDescription>
              {t('chat.renameChatDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="chat-title">{t('chat.chatTitle')}</Label>
            <Input
              id="chat-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('chat.chatTitlePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRenameSubmit}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
