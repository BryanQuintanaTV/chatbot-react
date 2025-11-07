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
      const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
      const shift = event.shiftKey;
      const alt = event.altKey;
      const key = event.key.toLowerCase();

      // Don't trigger shortcuts when typing in input fields (except for specified keys)
      const isTyping = ['input', 'textarea'].includes(event.target.tagName?.toLowerCase());
      const isContentEditable = event.target.isContentEditable;

      // Build the key combination string
      let keyCombination = '';
      if (ctrl) keyCombination += 'ctrl+';
      if (shift) keyCombination += 'shift+';
      if (alt) keyCombination += 'alt+';
      keyCombination += key;

      // Console log for debugging
      console.log('[Keyboard Shortcut]', keyCombination, 'isTyping:', isTyping);

      // Check if this combination has a handler
      const handler = shortcuts[keyCombination];

      if (handler) {
        console.log('[Keyboard Shortcut] Handler found for:', keyCombination);

        // IMMEDIATELY prevent default for shortcuts with modifiers (ctrl, alt, shift)
        // This must happen BEFORE any other checks to prevent browser default behavior
        // (like Ctrl+N opening new window, Ctrl+W closing tab, etc.)
        if (ctrl || alt || (shift && key !== 'enter')) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Allow certain shortcuts even when typing
        const allowedWhenTyping = ['escape', 'ctrl+/', 'enter'];
        const shouldExecute = (!isTyping && !isContentEditable) ||
                              allowedWhenTyping.includes(keyCombination);

        if (shouldExecute) {
          console.log('[Keyboard Shortcut] Executing handler for:', keyCombination);
          // For 'enter' key, only prevent default if NOT in textarea (to allow Shift+Enter)
          if (keyCombination === 'escape') {
            event.preventDefault();
          }

          handler(event);
        } else {
          console.log('[Keyboard Shortcut] Skipped (typing):', keyCombination);
        }
      }
    };

    console.log('[Keyboard Shortcuts] Registering shortcuts:', Object.keys(shortcuts));
    // Use capture phase (true) to handle events before they bubble up
    // This gives us higher priority to prevent default browser behavior
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      console.log('[Keyboard Shortcuts] Unregistering shortcuts');
      window.removeEventListener('keydown', handleKeyDown, true);
    };
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
