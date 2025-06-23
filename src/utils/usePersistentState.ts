import { useState } from 'react';

function usePersistentState<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const updateState = (value: T) => {
    setState(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to store state', err);
    }
  };

  return [state, updateState];
}

export default usePersistentState;
