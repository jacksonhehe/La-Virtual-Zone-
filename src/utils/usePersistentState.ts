import { useState, useEffect, Dispatch, SetStateAction } from 'react';

const PREFIX = 'vz_';

function getInitialValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const stored = localStorage.getItem(PREFIX + key);
    if (stored !== null) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // ignore parsing errors
  }

  return defaultValue;
}

export default function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => getInitialValue(key, defaultValue));

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  return [state, setState];
}
