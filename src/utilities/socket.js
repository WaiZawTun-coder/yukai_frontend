import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL +
    ":" +
    process.env.NEXT_PUBLIC_SOCKET_PORT || "http://localhost:8080";

console.log({ SOCKET_URL });

let connected = false;

// Create socket instance only once
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

/* ---------------------- Connection ---------------------- */

/**
 * Connect socket
 */
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("🟢 Socket connecting...");
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔴 Socket disconnected");
  }
};

/* ---------------------- Room Management ---------------------- */

/**
 * Join chat room
 */
export const joinRoom = (roomId) => {
  if (!roomId) return;
  socket.emit("join-room", roomId);
};

/**
 * Leave chat room
 */
export const leaveRoom = (roomId) => {
  if (!roomId) return;
  socket.emit("leave-room", roomId);
};

/* ---------------------- Messaging ---------------------- */

/**
 * Send message
 */
export const sendMessage = (message) => {
  if (!message) return;
  socket.emit("send-message", message);
};

/**
 * Listen for incoming messages
 */
export const onReceiveMessage = (callback) => {
  socket.on("receive-message", callback);
};

/**
 * Remove listener for incoming messages
 */
export const offReceiveMessage = () => {
  socket.off("receive-message");
};

/* ---------------------- Receipts ---------------------- */
export const emitUpdateReceipt = (messageId, chatId, status = "delivered") => {
  if (!messageId || !chatId) return;
  socket.emit("update-receipt", {
    message_id: messageId,
    chat_id: chatId,
    status,
  });
};

/**
 * Listen for receipt updates from server
 */
export const onReceiptUpdate = (callback) => {
  socket.on("receipt-update", callback);
};

/**
 * Remove listener for receipt updates
 */
export const offReceiptUpdate = () => {
  socket.off("update-receipt");
};
