"use client";

import { useAuth } from "@/context/AuthContext";
import { useBusy } from "@/context/BusyContext";
import { useCall } from "@/context/CallContext";
import { useNotification } from "@/context/NotificationContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import {
  offNewMessage,
  offNewNotification,
  onNewMessage,
  onNewNotification,
  socket,
} from "@/utilities/socket";
import { useEffect, useRef } from "react";

export const useSocket = () => {
  const { addMessage, addCall } = useNotification();
  const { addCall: addCallContext } = useCall();
  const { updateBusy } = useBusy();
  const { setNotificationCount, setMessageCount } = useAuth();
  const apiFetch = useApi();
  const { showSnackbar } = useSnackbar();

  const addMessageRef = useRef(addMessage);
  const addCallRef = useRef(addCall);
  const addCallContextRef = useRef(addCallContext);

  useEffect(() => {
    addMessageRef.current = addMessage;
    addCallRef.current = addCall;
    addCallContextRef.current = addCallContext;
  }, [addMessage, addCall, addCallContext]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      const notiCountRes = await apiFetch("/api/get-notification-count");
      if (notiCountRes.status) {
        setNotificationCount(notiCountRes.data.unread ?? 0);
      }

      const messageCountRes = await apiFetch("/api/get-unread-message-count");
      if (messageCountRes.status) {
        setMessageCount(messageCountRes.data.unread_count ?? 0);
      }
    };

    fetchNotificationCount();
  }, [apiFetch, setNotificationCount, setMessageCount]);

  useEffect(() => {
    /* ============================
       Message Listener
    ============================ */
    const handleNewMessage = (msg) => {
      const activeChatId = window.__ACTIVE_CHAT_ID__;
      if (msg.chat_id === activeChatId) return;

      const fromUser = msg.sender_user_id || msg.fromUser || msg.fromUserId;
      setMessageCount((prev) => prev + 1);

      if (!fromUser) return;

      addMessageRef.current(fromUser, msg);
    };

    const handleNewNotification = () => {
      setNotificationCount((prev) => prev + 1);
    };

    /* ============================
       Busy Status Listener (optional UI)
    ============================ */
    const handleBusy = (data) => {};

    onNewNotification(handleNewNotification);

    onNewMessage(handleNewMessage);
    // socket.on("busy-status", handleBusy);

    return () => {
      offNewMessage(handleNewMessage);
      offNewNotification(handleNewNotification);
      // socket.off("busy-status", handleBusy);
    };
  }, []);

  return socket;
};
