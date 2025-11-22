import { useState, useEffect, useRef } from "react";

export type SaveStatus = "idle" | "saving" | "saved";

export function useAutoSave<T>(key: string, initial: T) {
  // Load initial state
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...(initial as any), ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<number | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setSaveStatus("saving");

    // clear previous timeout if exists (debounce)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Simulate a tiny delay so "saving" is visible or just save immediately?
    // LocalStorage is sync, but we want to show the feedback.
    // Let's save immediately but show "Saved" after.

    try {
      localStorage.setItem(key, JSON.stringify(val));

      // Show "Saved" state after a brief moment
      timeoutRef.current = window.setTimeout(() => {
        setSaveStatus("saved");

        // Revert to idle after showing "Saved"
        timeoutRef.current = window.setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      }, 500);

    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [key, val]);

  return [val, setVal, saveStatus] as const;
}
