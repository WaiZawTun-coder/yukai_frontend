"use client";

import { useCall } from "@/context/CallContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

import { endCall, onEndCall, offEndCall } from "@/utilities/socket";

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
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const inactivityTimerRef = useRef(null);

  /* ---------------- Mount ---------------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------- Handle remote end call ---------------- */
  useEffect(() => {
    const handleCallEnded = () => {
      stopCall();
      router.back();
    };

    onEndCall(handleCallEnded);

    return () => {
      offEndCall(handleCallEnded);
    };
  }, [stopCall, router]);

  /* ---------------- Local video ---------------- */
  useEffect(() => {
    if (!inCall || callType !== "video" || cameraOff || !mounted) return;

    const el = localVideoRef.current;
    const track = localTracks.current?.video;

    if (!el || !track) return;

    setTimeout(async () => {
      try {
        await track.play(el, { fit: "cover" });
      } catch (err) {
        console.error("Local video play failed:", err);
      }
    }, 100);

    return () => {
      track?.stop();
      if (el) el.innerHTML = "";
    };
  }, [inCall, cameraOff, callType, mounted]);

  /* ---------------- Remote subscription ---------------- */
  useEffect(() => {
    if (!inCall || !clientRef.current || !mounted) return;

    const client = clientRef.current;

    const subscribeUser = async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteUid(user.uid);
          setRemoteVideoTrack(user.videoTrack);
        }

        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      } catch (err) {
        console.error("Subscribe failed:", err);
      }
    };

    Object.values(client.remoteUsers || {}).forEach((user) => {
      if (user.hasAudio) subscribeUser(user, "audio");
      if (user.hasVideo) subscribeUser(user, "video");
    });

    const handleUserPublished = (user, mediaType) =>
      subscribeUser(user, mediaType);

    const handleUserLeft = () => {
      setRemoteUid(null);
      setRemoteVideoTrack(null);
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
    };

    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-left", handleUserLeft);
    };
  }, [inCall, mounted]);

  /* ---------------- Remote video playback ---------------- */
  useEffect(() => {
    if (!remoteUid || !remoteVideoTrack || !mounted) return;

    const el = remoteVideoRef.current;
    if (!el) return;

    setTimeout(async () => {
      try {
        await remoteVideoTrack.play(el, { fit: "cover" });
      } catch (err) {
        console.error("Remote video play failed:", err);
      }
    }, 150);

    return () => {
      remoteVideoTrack?.stop();
      if (el) el.innerHTML = "";
    };
  }, [remoteUid, remoteVideoTrack, mounted]);

  /* ---------------- Call sounds ---------------- */
  useEffect(() => {
    if (inCall) playSound("/sounds/call-join.mp3");
    return () => playSound("/sounds/call-end.mp3");
  }, [inCall]);

  /* ---------------- Controls auto hide ---------------- */
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
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

  /* ---------------- Actions ---------------- */
  const handleEnd = () => {
    if (remoteUserInfo?.user_id) {
      endCall(remoteUserInfo.user_id);
    }
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
      <div className="video-stage">
        {!showAvatar ? (
          <div ref={remoteVideoRef} className="remote-video" />
        ) : (
          <AudioAvatar user={remoteUserInfo} callType={callType} />
        )}

        {callType === "video" && !cameraOff && (
          <div className="local-pip">
            <div ref={localVideoRef} className="local-video" />
          </div>
        )}
      </div>

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

        <IconButton
          onClick={handleEnd}
          style={{ backgroundColor: "#e53935", color: "#fff" }}
        >
          <CallEndIcon />
        </IconButton>
      </div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */
function AudioAvatar({ user, callType }) {
  return (
    <div className="audio-avatar">
      <Avatar src={user?.avatar} sx={{ width: 140, height: 140 }} />
      <h2>{user?.username || "Unknown"}</h2>
      <p>{callType.charAt(0).toUpperCase() + callType.slice(1)} Call</p>
    </div>
  );
}
