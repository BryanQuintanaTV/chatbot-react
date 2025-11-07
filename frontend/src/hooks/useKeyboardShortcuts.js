import { useEffect } from 'react';

/**
 * Hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Get the pressed key combination
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
      const shift = event.shiftKey;
      const alt = event.altKey;
      const key = event.key.toLowerCase();

      // Don't trigger shortcuts when typing in input fields (except for specified keys)
      const isTyping = ['input', 'textarea'].includes(event.target.tagName.toLowerCase());
      const isContentEditable = event.target.isContentEditable;

      // Build the key combination string
      let keyCombination = '';
      if (ctrl) keyCombination += 'ctrl+';
      if (shift) keyCombination += 'shift+';
      if (alt) keyCombination += 'alt+';
      keyCombination += key;

      // Check if this combination has a handler
      const handler = shortcuts[keyCombination];

      if (handler) {
        // Allow certain shortcuts even when typing
        const allowedWhenTyping = ['escape', 'ctrl+/', 'enter'];
        const shouldExecute = !isTyping && !isContentEditable ||
                              allowedWhenTyping.some(k => keyCombination.includes(k));

        if (shouldExecute) {
          event.preventDefault();
          handler(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Utility function to detect if user is on Mac
 */
export function isMac() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Get the modifier key text based on platform
 */
export function getModifierKey() {
  return isMac() ? '⌘' : 'Ctrl';
}
