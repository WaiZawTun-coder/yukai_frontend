import { io } from "socket.io-client";

/* ============================================================
   Config
============================================================ */
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

/* ============================================================
   Socket Instance (SINGLETON)
============================================================ */
export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually after auth
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    token: null,
    deviceId: null,
    username: null,
  },
});

/* ============================================================
   Debug & Lifecycle Logs
============================================================ */
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket connection error:", err.message);
});

/* ============================================================
   Auth Setup
============================================================ */
export const setSocketAuth = ({ token, deviceId, username }) => {
  socket.auth = {
    token,
    deviceId,
    username,
  };
};

/* ============================================================
   Connection Control
============================================================ */
export const connectSocket = () => {
  if (!socket.connected) {
    console.log("🟡 Connecting socket...");
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

/* ============================================================
   Room Management
============================================================ */
export const joinRoom = (roomId) => {
  if (!roomId) return;
  socket.emit("join-room", String(roomId));
};

export const leaveRoom = (roomId) => {
  if (!roomId) return;
  socket.emit("leave-room", String(roomId));
};

/* ============================================================
  Chat
============================================================ */
export const onChatCreate = (cb) => {
  socket.on("chat-created", cb);
};

export const offChatCreate = (cb) => {
  socket.off("chat-created", cb);
};

/* ============================================================
   Messaging
============================================================ */
export const sendMessage = (message) => {
  if (!message) return;
  socket.emit("send-message", message);
};

/* ============================================================
   Messaging – listeners
============================================================ */

export const onReceiveMessage = (cb) => {
  socket.on("receive-message", cb);
};

export const offReceiveMessage = (cb) => {
  socket.off("receive-message", cb);
};

export const onNewMessage = (cb) => {
  socket.on("new-message", cb);
};

export const offNewMessage = (cb) => {
  socket.off("new-message", cb);
};

export const emitTypingMessage = (chatId, userId) => {
  if (!chatId || !userId) return;
  socket.emit("typing", { chatId, userId });
};

export const emitStopTyping = (chatId, userId) => {
  if (!chatId || !userId) return;
  socket.emit("stop-typing", { chatId, userId });
};

export const onTypingMessage = (cb) => {
  socket.on("typing", cb);
};

export const offTypingMessage = (cb) => {
  socket.off("typing", cb);
};

/* ============================================================
   Receipts
============================================================ */
export const emitUpdateReceipt = (messageId, chatId, status = "delivered") => {
  if (!messageId || !chatId) return;

  socket.emit("update-receipt", {
    message_id: messageId,
    chat_id: chatId,
    status,
  });
};

/* ============================================================
   Receipts – listeners
============================================================ */

export const onReceiptUpdate = (cb) => {
  socket.on("receipt-update", cb);
};

export const offReceiptUpdate = (cb) => {
  socket.off("receipt-update", cb);
};

/* ============================================================
   Call Signaling
============================================================ */

export const makeCall = ({
  toUserId,
  fromUserId,
  callType = "video",
  caller,
  roomId,
}) => {
  if (!toUserId || !fromUserId || !caller || !roomId) return;

  socket.emit("call-user", {
    toUserId: String(toUserId),
    fromUserId: String(fromUserId),
    callType,
    caller,
    roomId,
  });

  console.log(`📞 Calling ${toUserId} (${callType})`);
};

export const onIncomingCall = (cb) => {
  socket.on("incoming-call", cb);
};

export const offIncomingCall = (cb) => {
  socket.off("incoming-call", cb);
};

export const onRejectedCall = (cb) => {
  socket.on("call-rejected", cb);
};

export const offRejectCall = (cb) => {
  socket.off("call-rejected", cb);
};

export const onEndCall = (cb) => {
  console.log("CALL ENDED - SOCKET");
  socket.on("call-ended", cb);
};

export const offEndCall = (cb) => {
  socket.off("call-ended", cb);
};

export const onUserBusy = (cb) => {
  socket.on("user-busy", cb);
};

export const offUserBusy = (cb) => {
  socket.off("user-busy", cb);
};

export const onCallUserOffline = (cb) => {
  socket.on("user-offline", cb);
};

export const offCallUserOffline = (cb) => {
  socket.off("user-offline", cb);
};

export const onStopRinging = (cb) => {
  socket.on("stop-ringing", cb);
};

export const offStopRinging = (cb) => {
  socket.off("socket-ringing", cb);
};

export const emitAnswerCall = (callId, toUserId) => {
  if (!callId || !toUserId) return;
  socket.emit("answer-call", {
    toUserId: toUserId,
    callId: callId,
  });
};

export const emitRejectCall = (callId, toUserId) => {
  if (!callId || !toUserId) return;
  socket.emit("reject-call", {
    toUserId: toUserId,
    callId: callId,
  });
};

export const endCall = (toUserId) => {
  console.log("END CALL - SOCKET");
  if (!toUserId) return;
  socket.emit("end-call", { toUserId: String(toUserId) });
};

/* ============================================================
   Presence
============================================================ */

export const checkUserOnline = (userId) => {
  socket.emit("check-user-online", String(userId));
};

/* ============================================================
   Presence – listeners
============================================================ */

export const requestOnlineUsers = () => {
  socket.emit("request-online-users");
};

export const onOnlineUsers = (cb) => {
  socket.on("online-users", cb);
};

export const onUserOnline = (cb) => {
  socket.on("user-online", cb);
};

export const onUserOffline = (cb) => {
  socket.on("user-offline", cb);
};

export const offPresenceListeners = () => {
  socket.off("online-users");
  socket.off("user-online");
  socket.off("user-offline");
};

/* ============================================================
   Presence – check user online
============================================================ */

export const onCheckUserOnline = (cb) => {
  socket.on("user-status", cb);
};

export const offCheckUserOnline = (cb) => {
  socket.off("user-status", cb);
};

/* ============================================================
   Notify user actions (react, comment, friend requests <sent request, accept request, follow>)
============================================================ */

export const emitPostReact = (payload) => {
  socket.emit("post-react", payload);
};

export const emitPostComment = (payload) => {
  socket.emit("post-comment", payload);
};

export const emitAccountRequest = (payload) => {
  socket.emit("account-request", payload);
};

export const emitPostCreate = (payload) => {
  socket.emit("post-create", payload);
};

export const onNotification = (cb) => {
  socket.on("notification", cb);
};

export const offNotification = (cb) => {
  socket.off("notification", cb);
};

/* ============================================================
   Utils
============================================================ */

export const isSocketConnected = () => socket.connected;
