"use client";

import { useCall } from "@/context/CallContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

const INACTIVITY_TIMEOUT = 3000;

const playSound = (src) => {
  const audio = new Audio(src);
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function CallPage() {
  const {
    localTracks,
    inCall,
    callType,
    stopCall,
    clientRef,
    toggleMic,
    toggleCamera,
    toggleSpeaker,
    micMuted,
    cameraOff,
    speakerMuted,
    remoteUserInfo,
  } = useCall();

  const router = useRouter();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteUid, setRemoteUid] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null); // New: Store the remote track
  const [mounted, setMounted] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------- Local video -------------------- */
  useEffect(() => {
    if (!inCall || callType !== "video" || cameraOff || !mounted) return;
    const el = localVideoRef.current;
    const track = localTracks.current?.video;
    console.log("Local video: Attempting to play", { el, track });
    if (!el || !track) {
      console.error("Local video: Missing element or track", { el, track });
      return;
    }

    setTimeout(async () => {
      if (el && track) {
        try {
          await track.play(el, { fit: "cover" });
          console.log("Local video: Play succeeded");
        } catch (err) {
          console.error("Local video play failed:", err);
        }
      }
    }, 100);

    return () => {
      if (track) track.stop();
      if (el) el.innerHTML = "";
    };
  }, [inCall, cameraOff, callType, localTracks.current?.video, mounted]);

  /* -------------------- Remote subscription -------------------- */
  useEffect(() => {
    if (!inCall || !clientRef.current || !mounted) return;
    const client = clientRef.current;

    const subscribeUser = async (user, mediaType) => {
      console.log("Subscribing to user:", user.uid, mediaType, {
        hasVideo: user.hasVideo,
        hasAudio: user.hasAudio,
      });
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteUid(user.uid);
          setRemoteVideoTrack(user.videoTrack); // New: Store the track for later playback
          console.log("Remote video track stored:", user.videoTrack);
        }

        if (mediaType === "audio") {
          if (user.audioTrack) user.audioTrack.play();
        }
      } catch (err) {
        console.error("Subscribe failed, retrying after 1s:", err);
        setTimeout(() => {
          subscribeUser(user, mediaType);
        }, 1000);
      }
    };

    console.log("Existing remote users:", client.remoteUsers);
    Object.values(client.remoteUsers || {}).forEach((user) => {
      if (user.hasAudio) subscribeUser(user, "audio");
      if (user.hasVideo) subscribeUser(user, "video");
    });

    const handleUserPublished = (user, mediaType) =>
      subscribeUser(user, mediaType);
    const handleUserLeft = (user) => {
      console.log("User left:", user.uid);
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
      setRemoteUid(null);
      setRemoteVideoTrack(null); // New: Clear the track
    };

    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-left", handleUserLeft);
    };
  }, [inCall, mounted]);

  /* -------------------- Remote video playback -------------------- */
  // New: Separate effect to play remote video after remoteUid is set and DOM is ready
  useEffect(() => {
    if (!remoteUid || !remoteVideoTrack || !mounted) return;
    const el = remoteVideoRef.current;
    console.log("Remote video: Attempting to play after UID set", {
      el,
      remoteVideoTrack,
    });
    if (!el) {
      console.error("Remote video: Element still null after UID set", { el });
      return;
    }

    setTimeout(async () => {
      if (el && remoteVideoTrack) {
        try {
          await remoteVideoTrack.play(el, { fit: "cover" });
          console.log("Remote video: Play succeeded");
        } catch (err) {
          console.error("Remote video play failed:", err);
        }
      }
    }, 200); // Slightly longer delay to ensure DOM update

    return () => {
      if (remoteVideoTrack) remoteVideoTrack.stop();
      if (el) el.innerHTML = "";
    };
  }, [remoteUid, remoteVideoTrack, mounted]); // Depends on remoteUid and track

  /* -------------------- Call sounds -------------------- */
  useEffect(() => {
    if (inCall) playSound("/sounds/call-join.mp3");
    return () => playSound("/sounds/call-end.mp3");
  }, [inCall]);

  /* -------------------- Controls -------------------- */
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    // Attach listeners for user activity
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("keydown", handleActivity);

    resetInactivityTimer();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  const handleEnd = () => {
    stopCall();
    router.back();
  };

  const handleMute = () => {
    toggleMic();
    playSound(micMuted ? "/sounds/unmute.mp3" : "/sounds/mute.mp3");
  };

  const handleCamera = () => toggleCamera();
  const handleSpeaker = () => toggleSpeaker();

  if (!inCall) return null;

  const showAvatar =
    callType === "audio" || (callType === "video" && !remoteUid);

  return (
    <div className="call-root">
      {/* ================= Video Stage ================= */}
      <div className="video-stage">
        {!showAvatar ? (
          <div ref={remoteVideoRef} className="remote-video" />
        ) : (
          <AudioAvatar user={remoteUserInfo} />
        )}

        {/* Local PiP */}
        {callType === "video" && !cameraOff && (
          <div className="local-pip">
            <div ref={localVideoRef} className="local-video" />
          </div>
        )}
      </div>

      {/* ================= Controls ================= */}
      <div
        className={`call-controls ${controlsVisible ? "visible" : "hidden"}`}
      >
        <IconButton onClick={handleMute}>
          {micMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>

        {callType === "video" && (
          <IconButton onClick={handleCamera}>
            {cameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        )}

        <IconButton onClick={handleSpeaker}>
          {speakerMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>

        <IconButton onClick={handleEnd} style={{ backgroundColor: "#e53935" }}>
          <CallEndIcon />
        </IconButton>
      </div>
    </div>
  );
}

/* ================= Audio Avatar ================= */
function AudioAvatar({ user }) {
  return (
    <div className="audio-avatar">
      <Avatar src={user?.avatar} sx={{ width: 140, height: 140 }} />
      <h2>{user?.username || "Unknown"}</h2>
      <p>Audio Call</p>
    </div>
  );
}
