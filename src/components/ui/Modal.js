"use client";

import { useEffect, useState, useRef } from "react";
import { useKeyboard } from "../postComposer/useKeyboard";

export default function Modal({ isOpen, onClose, children, title }) {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const contentRef = useRef(null);

  useKeyboard({
    enabled: true,
    onCancel: onClose,
  });

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // disable scroll
    } else {
      document.body.style.overflow = ""; // restore scroll
    }

    return () => {
      document.body.style.overflow = ""; // cleanup on unmount
    };
  }, [isOpen]);

  // Handle animation
  useEffect(() => {
    const startAnimation = () => {
      if (isOpen) {
        setShow(true);
        requestAnimationFrame(() => setAnimate(true));
      } else if (show) {
        setAnimate(false);
      }
    };
    startAnimation();
  }, [isOpen, show]);

  const handleTransitionEnd = (e) => {
    if (!animate && e.target === contentRef.current) {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className={`modal-overlay ${animate ? "open" : "close"}`}
      onClick={onClose}
    >
      <div
        className={`modal-content ${animate ? "open" : "close"}`}
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>

          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-main">{children}</div>
      </div>
    </div>
  );
}
