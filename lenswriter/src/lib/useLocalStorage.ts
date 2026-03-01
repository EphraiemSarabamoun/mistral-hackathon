"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, [key]);

  // Persist to localStorage whenever value changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [value, hydrated]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue(updater);
    },
    []
  );

  return [value, set, hydrated] as const;
}
