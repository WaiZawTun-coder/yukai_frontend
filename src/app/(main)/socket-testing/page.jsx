"use client";

import { useAuth } from "@/context/AuthContext";
import { socket } from "@/utilities/socket";
import { useEffect, useState } from "react";

const SocketTesting = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("connected", socket.id);
      socket.emit("join", { userId: user.user_id });
    });

    socket.on("notify", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("notify");
      socket.disconnect();
    };
  }, [user]);

  return (
    <div>
      <button
        onClick={() => {
          socket.emit("chat:send", {
            roomId: 1,
            text: `Hello I'm ${user.username}`,
          });
        }}
      >
        Send
      </button>
      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
};

export default SocketTesting;
