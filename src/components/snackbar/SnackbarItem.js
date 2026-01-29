"use client";

import React, { useEffect, useRef } from "react";

const SnackbarItem = ({
  title = "",
  message,
  variant = "info",
  onClose,
  duration = 3000,
  actions = null,
  persist = false,
  icon = null,
}) => {
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    if (persist) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      onClose?.();
    }, duration);
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [duration, persist]);

  return (
    <div
      className={`snackbar snackbar-${variant}`}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      {icon && <div className="snackbar-icon">{icon}</div>}

      <div className="snackbar-content">
        {title && <div className="snackbar-title">{title}</div>}
        <div className="snackbar-message">{message}</div>

        {actions && (
          <div
            className="snackbar-actions"
            onClick={(e) => e.stopPropagation()}
          >
            {React.Children.map(actions, (child) =>
              React.cloneElement(child, {
                onClick: (e) => {
                  e.stopPropagation();

                  // run the original onClick
                  const result = child.props.onClick?.(e);

                  // if it returns a promise, wait before closing
                  if (result && typeof result.then === "function") {
                    result.finally(() => onClose?.());
                  } else {
                    // otherwise close immediately
                    console.log("close");
                    onClose?.();
                  }
                },
              })
            )}
          </div>
        )}
      </div>

      <button className="snackbar-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default SnackbarItem;
