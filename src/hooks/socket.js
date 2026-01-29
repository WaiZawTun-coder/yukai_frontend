"use client";

import { useEffect, useRef } from "react";
import { offNewMessage, onNewMessage, socket } from "@/utilities/socket";
import { useNotification } from "@/context/NotificationContext";
import { useCall } from "@/context/CallContext";
import { useBusy } from "@/context/BusyContext";

export const useSocket = () => {
  const { addMessage, addCall } = useNotification();
  const { addCall: addCallContext } = useCall();
  const { updateBusy } = useBusy();

  const addMessageRef = useRef(addMessage);
  const addCallRef = useRef(addCall);
  const addCallContextRef = useRef(addCallContext);

  useEffect(() => {
    addMessageRef.current = addMessage;
    addCallRef.current = addCall;
    addCallContextRef.current = addCallContext;
  }, [addMessage, addCall, addCallContext]);

  useEffect(() => {
    /* ============================
       Message Listener
    ============================ */
    const handleNewMessage = (msg) => {
      console.log("new Message");
      const activeChatId = window.__ACTIVE_CHAT_ID__;
      if (msg.chat_id === activeChatId) return;

      const fromUser = msg.sender_user_id || msg.fromUser || msg.fromUserId;

      if (!fromUser) return;

      addMessageRef.current(fromUser, msg);
    };

    /* ============================
       Busy Status Listener (optional UI)
    ============================ */
    const handleBusy = (data) => {
      updateBusy(data.userId, data.busy);
      console.log("🚦 Busy status:", data);
    };

    onNewMessage(handleNewMessage);
    // socket.on("busy-status", handleBusy);

    return () => {
      offNewMessage(handleNewMessage);
      // socket.off("busy-status", handleBusy);
    };
  }, []);

  return socket;
};
