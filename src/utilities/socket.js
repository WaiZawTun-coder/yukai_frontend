import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

let connected = false;

/**
 * Create socket instance only once
 */
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

/**
 * Connect socket
 */
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("Socket connecting...");
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

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

/**
 * Send message
 */
export const sendMessage = (message) => {
  if (!message) return;
  socket.emit("send-message", message);
};

/**
 * Listen receive message
 */
export const onReceiveMessage = (callback) => {
  socket.on("receive-message", callback);
};

/**
 * Remove receive listener
 */
export const offReceiveMessage = () => {
  socket.off("receive-message");
};
