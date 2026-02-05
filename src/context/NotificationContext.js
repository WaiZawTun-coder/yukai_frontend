"use client";

import { createContext, useCallback, useContext, useState } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [calls, setCalls] = useState([]);

  // Add a new message notification
  const addMessage = useCallback((fromUser, message) => {
    if (!fromUser) return;
    setMessages((prev) => {
      if (prev.some((m) => m.message.message_id === message.message_id))
        return prev;
      return [...prev, { fromUser, message, id: message.message_id }];
    });
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  // Add a new call notification
  const addCall = useCallback((fromUser, callId) => {
    setCalls((prev) => [...prev, { fromUser, callId, id: Date.now() }]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ messages, calls, addMessage, addCall, removeMessage }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Hook to consume the context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used inside a NotificationProvider"
    );
  }
  return context;
};
