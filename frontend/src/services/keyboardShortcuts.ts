type ShortcutHandler = (event: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  handler: ShortcutHandler;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, Shortcut> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return;

    // Ignore if typing in an input or textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const shortcutKey = this.getShortcutKey(event);

    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      event.preventDefault();
      shortcut.handler(event);
    }
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    modifiers.push(event.key.toLowerCase());
    return modifiers.join('+');
  }

  registerShortcut(shortcut: Shortcut): void {
    const shortcutKey = this.getShortcutKey({
      key: shortcut.key,
      ctrlKey: shortcut.ctrlKey,
      shiftKey: shortcut.shiftKey,
      altKey: shortcut.altKey,
    } as KeyboardEvent);

    this.shortcuts.set(shortcutKey, shortcut);
  }

  unregisterShortcut(shortcut: Shortcut): void {
    const shortcutKey = this.getShortcutKey({
      key: shortcut.key,
      ctrlKey: shortcut.ctrlKey,
      shiftKey: shortcut.shiftKey,
      altKey: shortcut.altKey,
    } as KeyboardEvent);

    this.shortcuts.delete(shortcutKey);
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getRegisteredShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  unregisterAll(): void {
    this.shortcuts.clear();
  }
}

export const keyboardShortcuts = new KeyboardShortcutsService();

// Common video player shortcuts
export const registerVideoPlayerShortcuts = (
  onPlayPause: () => void,
  onSeekForward: () => void,
  onSeekBackward: () => void,
  onToggleMute: () => void,
  onToggleFullscreen: () => void,
  onNextFrame: () => void,
  onPreviousFrame: () => void
) => {
  keyboardShortcuts.registerShortcut({
    key: ' ',
    description: 'Play/Pause',
    handler: onPlayPause,
  });

  keyboardShortcuts.registerShortcut({
    key: 'arrowright',
    description: 'Seek Forward',
    handler: onSeekForward,
  });

  keyboardShortcuts.registerShortcut({
    key: 'arrowleft',
    description: 'Seek Backward',
    handler: onSeekBackward,
  });

  keyboardShortcuts.registerShortcut({
    key: 'm',
    description: 'Toggle Mute',
    handler: onToggleMute,
  });

  keyboardShortcuts.registerShortcut({
    key: 'f',
    description: 'Toggle Fullscreen',
    handler: onToggleFullscreen,
  });

  keyboardShortcuts.registerShortcut({
    key: '.',
    description: 'Next Frame',
    handler: onNextFrame,
  });

  keyboardShortcuts.registerShortcut({
    key: ',',
    description: 'Previous Frame',
    handler: onPreviousFrame,
  });
};

// Annotation shortcuts
export const registerAnnotationShortcuts = (
  onAddAnnotation: () => void,
  onEditAnnotation: () => void,
  onDeleteAnnotation: () => void
) => {
  keyboardShortcuts.registerShortcut({
    key: 'a',
    ctrlKey: true,
    description: 'Add Annotation',
    handler: onAddAnnotation,
  });

  keyboardShortcuts.registerShortcut({
    key: 'e',
    ctrlKey: true,
    description: 'Edit Annotation',
    handler: onEditAnnotation,
  });

  keyboardShortcuts.registerShortcut({
    key: 'd',
    ctrlKey: true,
    description: 'Delete Annotation',
    handler: onDeleteAnnotation,
  });
};

// Navigation shortcuts
export const registerNavigationShortcuts = (
  onNextStep: () => void,
  onPreviousStep: () => void,
  onToggleComparison: () => void
) => {
  keyboardShortcuts.registerShortcut({
    key: 'arrowdown',
    description: 'Next Step',
    handler: onNextStep,
  });

  keyboardShortcuts.registerShortcut({
    key: 'arrowup',
    description: 'Previous Step',
    handler: onPreviousStep,
  });

  keyboardShortcuts.registerShortcut({
    key: 'c',
    ctrlKey: true,
    description: 'Toggle Comparison View',
    handler: onToggleComparison,
  });
};

// Utility function to unregister all shortcuts
export const unregisterAllShortcuts = () => {
  keyboardShortcuts.unregisterAll();
}; 