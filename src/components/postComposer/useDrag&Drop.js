import { useEffect } from "react";

export function useDragDrop(ref, onFiles) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const drop = (e) => {
      prevent(e);
      if (e.dataTransfer?.files?.length) {
        onFiles(Array.from(e.dataTransfer.files));
      }
    };

    ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
      el.addEventListener(event, prevent)
    );

    el.addEventListener("drop", drop);

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
        el.removeEventListener(event, prevent)
      );
      el.removeEventListener("drop", drop);
    };
  }, [ref, onFiles]);
}
