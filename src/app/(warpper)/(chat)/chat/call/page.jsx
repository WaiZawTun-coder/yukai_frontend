"use client";

import { useCall } from "@/context/CallContext";
import { useEffect, useRef, useState } from "react";

export default function CallPage() {
  const { inCall, callType, playLocalVideo, stopCall, clientRef } = useCall();
  const localVideoRef = useRef(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [tick, setTick] = useState(0); // 🔥 force re-render trigger

  // Play local video
  useEffect(() => {
    if (inCall && callType === "video" && localVideoRef.current) {
      playLocalVideo(localVideoRef.current);
    }
  }, [inCall, callType, playLocalVideo]);

  // Handle remote users
  useEffect(() => {
    if (!inCall) return;
    const client = clientRef.current;
    if (!client) return;

    const subscribeUser = async (user, mediaType) => {
      console.log("🔔 Subscribing:", user.uid, mediaType);

      await client.subscribe(user, mediaType);

      console.log("✅ Subscribed:", user.uid, mediaType, {
        audio: !!user.audioTrack,
        video: !!user.videoTrack,
      });

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }

      // Keep original Agora user object (DO NOT spread)
      setRemoteUsers((prev) => {
        const map = new Map(prev.map((u) => [u.uid, u]));
        map.set(user.uid, user);
        return Array.from(map.values());
      });

      // 🔥 Force React refresh so videoTrack becomes visible to UI
      setTick((t) => t + 1);
    };

    // Existing users (callee case)
    Object.values(client.remoteUsers).forEach(async (user) => {
      if (user.hasAudio) await subscribeUser(user, "audio");
      if (user.hasVideo) await subscribeUser(user, "video");
    });

    // New users
    const handleUserPublished = async (user, mediaType) => {
      console.log("📡 user-published:", user.uid, mediaType);
      await subscribeUser(user, mediaType);
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserLeft);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserLeft);
      client.off("user-left", handleUserLeft);
    };
  }, [inCall, clientRef]);

  if (!inCall) {
    return (
      <div className="call-page-center">
        <h2>Not in a call</h2>
      </div>
    );
  }

  return (
    <div className="call-page">
      <h2>{callType === "video" ? "Video Call" : "Audio Call"}</h2>

      <div className="video-container">
        {/* Local video */}
        {callType === "video" && (
          <div className="video-box">
            <div ref={localVideoRef} className="video-player" />
            <span className="video-label">You</span>
          </div>
        )}

        {/* Remote videos */}
        {remoteUsers.map((user) => (
          <RemoteVideo key={user.uid} user={user} tick={tick} />
        ))}
      </div>

      <div className="controls">
        <button className="end-call-btn" onClick={stopCall}>
          End Call
        </button>
      </div>
    </div>
  );
}

// -------------------
// Remote Video Component
// -------------------
function RemoteVideo({ user, tick }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!user.videoTrack) return;

    console.log("▶️ Playing remote video:", user.uid);

    ref.current.innerHTML = "";
    user.videoTrack.stop();
    user.videoTrack.play(ref.current);
  }, [user, tick]);

  return (
    <div className="video-box">
      <div ref={ref} className="video-player" />
      <span className="video-label">{user.uid}</span>
    </div>
  );
}
