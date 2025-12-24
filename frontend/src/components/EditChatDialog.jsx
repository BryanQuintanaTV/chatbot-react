import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';

// Predefined chat icons using Lucide icons
const CHAT_ICONS = [
  { icon: MessageSquare, name: 'MessageSquare' },
  { icon: MessagesSquare, name: 'MessagesSquare' },
  { icon: FileText, name: 'FileText' },
  { icon: ClipboardList, name: 'ClipboardList' },
  { icon: BookOpen, name: 'BookOpen' },
  { icon: Target, name: 'Target' },
  { icon: Star, name: 'Star' },
  { icon: Lightbulb, name: 'Lightbulb' },
  { icon: Flame, name: 'Flame' },
  { icon: Sparkles, name: 'Sparkles' },
  { icon: Palette, name: 'Palette' },
  { icon: Book, name: 'Book' },
  { icon: Newspaper, name: 'Newspaper' },
  { icon: GraduationCap, name: 'GraduationCap' },
  { icon: Briefcase, name: 'Briefcase' },
  { icon: Home, name: 'Home' },
  { icon: Gamepad2, name: 'Gamepad2' },
  { icon: Music, name: 'Music' },
  { icon: Film, name: 'Film' },
  { icon: Dumbbell, name: 'Dumbbell' },
  { icon: Brain, name: 'Brain' },
  { icon: Heart, name: 'Heart' },
  { icon: Code, name: 'Code' },
  { icon: Coffee, name: 'Coffee' },
  { icon: Rocket, name: 'Rocket' },
];

// Predefined categories (values in English for consistency in DB)
const CHAT_CATEGORIES_KEYS = [
  'uncategorized',
  'work',
  'school',
  'personal',
  'projects',
  'ideas',
  'research',
  'homework',
];

// Helper to check if icon name is valid
const isValidIcon = (iconName) => {
  return CHAT_ICONS.some(item => item.name === iconName);
};

// Helper to normalize category to valid option
const normalizeCategory = (category) => {
  if (!category || category === '') return 'uncategorized';

  // Check if it's already a valid key
  if (CHAT_CATEGORIES_KEYS.includes(category)) {
    return category;
  }

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

  return legacyMapping[category] || 'uncategorized';
};

// Predefined color categories
const CHAT_COLORS = [
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Naranja', value: '#F97316' },
];

// Predefined background colors
const BG_COLORS = [
  { name: 'Ninguno', value: null },
  { name: 'Morado Claro', value: 'rgba(139, 92, 246, 0.1)' },
  { name: 'Azul Claro', value: 'rgba(59, 130, 246, 0.1)' },
  { name: 'Verde Claro', value: 'rgba(16, 185, 129, 0.1)' },
  { name: 'Amarillo Claro', value: 'rgba(245, 158, 11, 0.1)' },
  { name: 'Rojo Claro', value: 'rgba(239, 68, 68, 0.1)' },
  { name: 'Rosa Claro', value: 'rgba(236, 72, 153, 0.1)' },
  { name: 'Cyan Claro', value: 'rgba(6, 182, 212, 0.1)' },
];

export function EditChatDialog({ open, onOpenChange, chat, onSave }) {
  const { t } = useTranslation();

  // Build translated categories array
  const CHAT_CATEGORIES = CHAT_CATEGORIES_KEYS.map(key => ({
    value: key,
    label: t(`chat.categories.${key}`) || key
  }));
  const [formData, setFormData] = useState({
    title: chat?.title || '',
    icon: isValidIcon(chat?.icon) ? chat.icon : 'MessageSquare',
    color: chat?.color || '#8B5CF6',
    category: normalizeCategory(chat?.category),
    pinned: chat?.pinned || false,
    archived: chat?.archived || false,
    bgColor: chat?.bgColor || null,
  });

  // Update form data only when dialog opens
  useEffect(() => {
    if (chat && open) {
      setFormData({
        title: chat.title || '',
        icon: isValidIcon(chat.icon) ? chat.icon : 'MessageSquare',
        color: chat.color || '#8B5CF6',
        category: normalizeCategory(chat.category),
        pinned: chat.pinned || false,
        archived: chat.archived || false,
        bgColor: chat.bgColor || null,
      });
    }
  }, [chat?.id, open]); // Only reset when chat ID changes or dialog opens

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: chat?.title || '',
      icon: isValidIcon(chat?.icon) ? chat.icon : 'MessageSquare',
      color: chat?.color || '#8B5CF6',
      category: normalizeCategory(chat?.category),
      pinned: chat?.pinned || false,
      archived: chat?.archived || false,
      bgColor: chat?.bgColor || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle>{t('chat.editChat') || 'Editar Chat'}</DialogTitle>
          <DialogDescription>
            {t('chat.editChatDescription') || 'Personaliza tu conversación con nombre, icono, color y más.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-6 py-4 px-1">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="chat-name">{t('chat.chatName') || 'Nombre'}</Label>
              <Input
                id="chat-name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('chat.chatNamePlaceholder') || 'Ej: Ayuda con matemáticas'}
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>{t('chat.icon') || 'Icono'}</Label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {CHAT_ICONS.map((iconItem) => {
                  const IconComponent = iconItem.icon;
                  return (
                    <button
                      key={iconItem.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconItem.name })}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-md
                        transition-all hover:scale-110 hover:bg-muted
                        ${formData.icon === iconItem.name ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}
                      `}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>{t('chat.titleColor') || 'Color del Título'}</Label>
              <div className="grid grid-cols-4 gap-2">
                {CHAT_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: colorOption.value })}
                    className={`
                      h-10 rounded-md flex items-center justify-center text-xs font-medium
                      transition-all hover:scale-105
                      ${formData.color === colorOption.value ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    `}
                    style={{ backgroundColor: colorOption.value, color: 'white' }}
                  >
                    {formData.color === colorOption.value && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label>{t('chat.backgroundColor') || 'Color de Fondo'}</Label>
              <div className="grid grid-cols-4 gap-2">
                {BG_COLORS.map((bgOption) => (
                  <button
                    key={bgOption.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, bgColor: bgOption.value })}
                    className={`
                      h-10 rounded-md flex items-center justify-center text-xs border
                      transition-all hover:scale-105
                      ${formData.bgColor === bgOption.value ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    `}
                    style={{
                      backgroundColor: bgOption.value || 'transparent',
                      borderColor: bgOption.value ? 'transparent' : 'hsl(var(--border))',
                    }}
                  >
                    {formData.bgColor === bgOption.value && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="chat-category">{t('chat.category') || 'Categoría'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('chat.categoryPlaceholder') || 'Selecciona una categoría'} />
                </SelectTrigger>
                <SelectContent>
                  {CHAT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('chat.categoryHelp') || 'Organiza tus chats en carpetas personalizadas'}
              </p>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('chat.pinChat') || 'Fijar Chat'}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('chat.pinChatHelp') || 'Mantener al inicio de la lista'}
                </p>
              </div>
              <Switch
                checked={formData.pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
              />
            </div>

            {/* Archive Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('chat.archiveChat') || 'Archivar Chat'}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('chat.archiveChatHelp') || 'Ocultar de la lista principal'}
                </p>
              </div>
              <Switch
                checked={formData.archived}
                onCheckedChange={(checked) => setFormData({ ...formData, archived: checked })}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
