import { useState, useCallback, useRef } from 'react';

export function useActionMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Handle opening the menu for a specific item
  const handleOpenMenu = useCallback((item: any) => {
    setSelectedItem(item);
    setMenuVisible(true);
  }, []);

  // Handle closing the menu
  const handleCloseMenu = useCallback(() => {
    pendingActionRef.current = null; // Clear any pending action
    setMenuVisible(false);
  }, []);

  // Function to register a pending action to be executed after menu closes
  const registerPendingAction = useCallback((action: () => void) => {
    pendingActionRef.current = action;
  }, []);

  // Execute a pending action if one is registered
  const executePendingAction = useCallback(() => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  }, []);

  // Execute action with menu closing
  const executeWithMenuClose = useCallback((action: () => void) => {
    // First close the menu
    setMenuVisible(false);
    
    // Wait for close animation before executing the action
    setTimeout(() => {
      action();
    }, 300);
  }, []);

  return {
    menuVisible,
    selectedItem,
    handleOpenMenu,
    handleCloseMenu,
    registerPendingAction,
    executePendingAction,
    executeWithMenuClose
  };
} 