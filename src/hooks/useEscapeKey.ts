import { useEffect } from 'react';

export default function useEscapeKey(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, active]);
}
