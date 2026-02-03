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
  console.error("❌ Socket connection error:", err.message);
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

  console.log("🔐 Socket auth updated:", socket.auth);
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

export const answerCall = (toUserId) => {
  if (!toUserId) return;
  socket.emit("answer-call", { toUserId: String(toUserId) });
};

export const rejectCall = (toUserId) => {
  if (!toUserId) return;
  socket.emit("reject-call", { toUserId: String(toUserId) });
};

export const endCall = (toUserId) => {
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
