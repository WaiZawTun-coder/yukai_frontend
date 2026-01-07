"use client";

import { useEffect, useRef } from "react";

const SnackbarItem = ({
  title = "",
  message,
  variant = "info",
  onClose,
  duration = 3000,
}) => {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setTimeout(onClose, duration);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, []);

  return (
    <div
      className={`snackbar snackbar-${variant}`}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      <div className="snackbar-content">
        {title && <div className="snackbar-title">{title}</div>}
        <div className="snackbar-message">{message}</div>
      </div>

      <button className="snackbar-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default SnackbarItem;
