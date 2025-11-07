import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { getModifierKey } from '@/hooks/useKeyboardShortcuts';
import { useTranslation } from 'react-i18next';

export function KeyboardShortcutsDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const modKey = getModifierKey();

  const shortcuts = [
    {
      category: t('shortcuts.navigation'),
      items: [
        {
          keys: [modKey, 'B'],
          description: t('shortcuts.toggleSidebar'),
        },
        {
          keys: [modKey, 'N'],
          description: t('shortcuts.newChat'),
        },
        {
          keys: [modKey, ','],
          description: t('shortcuts.openSettings'),
        },
        {
          keys: ['Esc'],
          description: t('shortcuts.closeSidebar'),
        },
      ],
    },
    {
      category: t('shortcuts.chat'),
      items: [
        {
          keys: [modKey, '/'],
          description: t('shortcuts.focusInput'),
        },
        {
          keys: ['Enter'],
          description: t('shortcuts.sendMessage'),
        },
        {
          keys: [modKey, 'L'],
          description: t('shortcuts.clearChat'),
        },
      ],
    },
    {
      category: t('shortcuts.chatNavigation'),
      items: [
        {
          keys: [modKey, '↑'],
          description: t('shortcuts.previousChat'),
        },
        {
          keys: [modKey, '↓'],
          description: t('shortcuts.nextChat'),
        },
        {
          keys: [modKey, '1-9'],
          description: t('shortcuts.goToChat'),
        },
      ],
    },
    {
      category: t('shortcuts.appearance'),
      items: [
        {
          keys: [modKey, 'D'],
          description: t('shortcuts.toggleTheme'),
        },
      ],
    },
    {
      category: t('shortcuts.utilities'),
      items: [
        {
          keys: [modKey, 'Shift', 'K'],
          description: t('shortcuts.showShortcuts'),
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-urbanist">
            {t('shortcuts.title')}
          </DialogTitle>
          <DialogDescription>
            {t('shortcuts.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <KbdGroup>
                      {shortcut.keys.map((key, keyIdx) => (
                        <Kbd key={keyIdx}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
