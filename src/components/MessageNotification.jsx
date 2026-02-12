import { useSnackbar } from "@/context/SnackbarContext";
import { useNotification } from "../context/NotificationContext";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useApi } from "@/utilities/api";
import { useAuth } from "@/context/AuthContext";

const DISPLAY_TIME = 10000;

export const MessageNotifications = () => {
  const { messages, removeMessage } = useNotification();
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const { decryptPayload } = useAuth();

  const apiFetch = useApi();

  const processedRef = useRef(new Set());
  const snackbarIdRef = useRef(null);
  const timersRef = useRef([]);

  const hideMessage = useCallback(() => {
    if (snackbarIdRef.current) {
      removeSnackbar(snackbarIdRef.current);
      snackbarIdRef.current = null;
    }
  }, [removeSnackbar])

  useEffect(() => {
    messages.forEach(async (msg) => {
      if (processedRef.current.has(msg.id)) return;

      processedRef.current.add(msg.id);

      const isInsideChat = pathname.includes(msg.chatId);

      if (!isInsideChat) {
        const userDetail = (
          await apiFetch(`/api/get-user?user_id=${msg.fromUser}`)
        ).data;

        const plainText = await decryptPayload({
          ciphertext: msg.message.cipher_text,
          iv: msg.message.iv,
          sender_signed_prekey_pub: msg.message.sender_signed_prekey_pub,
        });

        snackbarIdRef.current = showSnackbar({
          title: "New Message",
          message: (
            <div
              className="message-notification clickable"
              onClick={() => router.push(`/chat/${userDetail.username}`)}
            >
              <Image
                src={
                  userDetail.profile_image
                    ? `/api/images?url=${userDetail.profile_image}`
                    : `/Images/default-profiles/${userDetail.gender}.jpg`
                }
                alt={userDetail.username}
                width={40}
                height={40}
                className="message-avatar"
              />

              <div className="message-body">
                <div className="message-username">
                  {userDetail.display_name}
                </div>
                <div className="message-text">{plainText}</div>
              </div>
            </div>
          ),
          variant: "notification",
          duration: 10000,
          actions: (
            <div className="snackbar-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/chat/${userDetail.username}`);
                }}
                className="snackbar-action-btn accept"
              >
                Open
              </button>
              <button className="snackbar-action-btn reject" onClick={() => {
                hideMessage()
              }}>Close</button>
            </div>
          ),
        });

        if (Notification.permission === "granted") {
          new Notification("New Message", {
            body: `${msg.fromUser}: ${msg.message}`,
            icon: "/message-icon.png",
          });
        }
      }

      const timer = setTimeout(() => {
        removeMessage(msg.id);
        processedRef.current.delete(msg.id);
      }, DISPLAY_TIME);

      timersRef.current.push(timer);
    });
  }, [messages, showSnackbar, removeMessage, router, pathname]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return null;
};
