"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCall } from "@/context/CallContext";

export default function FloatingCall() {
  const { minimized, setMinimized, inCall, playLocalVideo, stopCall } =
    useCall();

  const miniVideoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (minimized && inCall && miniVideoRef.current) {
      playLocalVideo(miniVideoRef.current);
    }
  }, [minimized, inCall]);

  if (!minimized || !inCall) return null;

  return (
    <div className="floating-call">
      <div
        ref={miniVideoRef}
        className="mini-video"
        onClick={() => {
          setMinimized(false);
          router.push("/call");
        }}
      />

      <button onClick={stopCall}>End</button>
    </div>
  );
}
