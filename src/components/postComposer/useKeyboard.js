import { useEffect } from "react";

export function useKeyboard({ enabled, onSubmit, onCancel }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }

      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onSubmit, onCancel]);
}
