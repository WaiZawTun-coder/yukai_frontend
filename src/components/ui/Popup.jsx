"use client";

import { useEffect, useRef, useState } from "react";

export default function Popup({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
}) {
  const [visible, setVisible] = useState(false);
  const popupRef = useRef(null);

  // Handle open / close animation
  useEffect(() => {
    const update = () => {
      if (isOpen) {
        setVisible(true);
        document.body.style.overflow = "hidden";
      } else if (visible) {
        setVisible(false);
        document.body.style.overflow = "";
      }
    };

    update();

    return () => (document.body.style.overflow = "");
  }, [isOpen, visible]);

  // ESC key support
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen && !visible) return null;

  return (
    <div
      className={`popup-overlay ${isOpen ? "open" : "close"}`}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={popupRef}
        className={`popup-container ${size} ${isOpen ? "open" : "close"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="popup-header">
            <h3 className="popup-title">{title}</h3>
            <button
              className="popup-close"
              onClick={onClose}
              aria-label="Close popup"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="popup-body">{children}</div>

        {/* Footer */}
        {footer && <div className="popup-footer">{footer}</div>}
      </div>
    </div>
  );
}
