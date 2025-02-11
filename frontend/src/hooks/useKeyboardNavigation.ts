import { useEffect } from 'react';

export function useKeyboardNavigation(navigationMap: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = navigationMap[event.key];
      if (handler && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationMap]);
} 