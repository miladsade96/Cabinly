import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    try { const storedValue = window.localStorage.getItem(key); return storedValue ? JSON.parse(storedValue) : initialState; } catch { return initialState; }
  });

  useEffect(
    function () {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
    },
    [value, key]
  );

  return [value, setValue];
}
