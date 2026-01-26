/**
 * Keyboard Shortcuts Hook
 * Provides keyboard shortcut functionality for the application
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param dependencies - Dependencies to trigger re-registration (optional)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  dependencies: any[] = []
) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: Allow Cmd/Ctrl+K for search even in inputs
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        // Let it through
      } else {
        return;
      }
    }

    // Check each shortcut
    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, ...dependencies]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

/**
 * Common keyboard shortcuts for the application
 */
export const COMMON_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Focus search' },
  NEW: { key: 'n', ctrl: true, description: 'Create new' },
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  CANCEL: { key: 'Escape', description: 'Cancel/Close' },
  EXPORT: { key: 'e', ctrl: true, description: 'Export data' },
  REFRESH: { key: 'r', ctrl: true, description: 'Refresh data' },
  HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts' },
};

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}
