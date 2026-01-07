"use client";

import { useEffect, useState, useRef } from "react";

export default function Modal({ isOpen, onClose, children }) {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const contentRef = useRef(null);

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
        {children}
      </div>
    </div>
  );
}
