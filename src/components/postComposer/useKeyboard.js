import { useEffect } from "react";

export function useKeyboard({ enabled, onSubmit, onCancel, onSearch }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit?.();
      }

      if (e.key === "Escape") {
        onCancel();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onSearch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onSubmit, onCancel, onSearch]);
}
