import { io } from "socket.io-client";

const socket = io("http://localhost:8080", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

export { socket };
