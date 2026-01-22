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
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
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

  const handleClose = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.overflow = "";
      mainContent.style.maxHeight = "fit-content";
    } // restore scroll
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className={`modal-overlay ${animate ? "open" : "close"}`}
      onClick={handleClose}
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
            onClick={handleClose}
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
