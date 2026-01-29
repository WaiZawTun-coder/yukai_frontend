"use client";

import { connectSocket } from "@/utilities/socket";
import { useSocket } from "@/hooks/socket";
import { useEffect } from "react";

export default function SocketInitializer() {
  useSocket();

  useEffect(() => {
    connectSocket();
  }, []);

  return null;
}
