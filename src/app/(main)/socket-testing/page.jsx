"use client";

import { useAuth } from "@/context/AuthContext";
import { socket } from "@/utilities/socket";
import { useEffect, useRef, useState } from "react";

const SocketTesting = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const joinedRef = useRef(false);

  // ✅ Connect socket once
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("connected", socket.id);
    };

    const handleNotify = (msg) => {
      console.log("notify:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("connect", handleConnect);
    socket.on("notify", handleNotify);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notify", handleNotify);
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("chat:receive", (msg) => {
      console.log("chat received:", msg);
      setMessages((prev) => [...prev, msg.text]);
    });

    return () => {
      socket.off("chat:receive");
    };
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;

    socket.emit("join:user", { userId: user.user_id });
    socket.emit("join:room", { roomId: 1 }); // example room
  }, [user]);

  const sendMessage = () => {
    if (!user) return;

    socket.emit("chat:send", {
      roomId: 1,
      text: `Hello I'm ${user.username}`,
    });
  };

  return (
    <div>
      <button onClick={sendMessage}>Send</button>

      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
};

export default SocketTesting;
