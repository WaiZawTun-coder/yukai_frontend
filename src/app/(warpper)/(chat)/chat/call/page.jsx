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
    toggleMic,
    toggleCamera,
    toggleSpeaker,
    micMuted,
    cameraOff,
    speakerMuted,
    remoteUsers,
    participants,
    playRemoteVideo,
    callerInfo,
  } = useCall();

  const router = useRouter();
  const localVideoRef = useRef(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const inactivityTimerRef = useRef(null);

  /* ---------------- End Call from socket ---------------- */
  useEffect(() => {
    const handleEnd = () => {
      stopCall();
      router.back();
    };

    onEndCall(handleEnd);
    return () => offEndCall(handleEnd);
  }, [stopCall, router]);

  /* ---------------- Local video ---------------- */
  useEffect(() => {
    if (!inCall || callType !== "video" || cameraOff) return;

    const el = localVideoRef.current;
    const track = localTracks.current?.video;
    if (!el || !track) return;

    el.innerHTML = "";
    track.play(el, { fit: "cover" });

    return () => {
      track.stop();
      el.innerHTML = "";
    };
  }, [inCall, callType, cameraOff]);

  /* ---------------- Call sounds ---------------- */
  useEffect(() => {
    if (inCall) playSound("/sounds/call-join.mp3");
    return () => playSound("/sounds/call-end.mp3");
  }, [inCall]);

  /* ---------------- Controls auto-hide ---------------- */
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      INACTIVITY_TIMEOUT
    );
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("mousedown", resetInactivityTimer);
    window.addEventListener("touchstart", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("mousedown", resetInactivityTimer);
      window.removeEventListener("touchstart", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  /* ---------------- Actions ---------------- */
  const handleEnd = () => {
    if (callerInfo?.user_id) {
      endCall(callerInfo.user_id);
    }
    stopCall();
    router.back();
  };

  if (!inCall) return null;

  const remoteUids = Object.keys(remoteUsers);
  const showAvatar = callType === "audio";

  return (
    <div className="call-root">
      <div className="video-stage grid">
        {!showAvatar &&
          remoteUids.map((uid) => {
            const profile = participants[uid];

            return (
              <div key={uid} className="remote-tile">
                <div
                  className="remote-video"
                  ref={(el) => el && playRemoteVideo(uid, el)}
                />

                <div className="remote-user-info">
                  <Avatar
                    src={profile?.profile}
                    sx={{ width: 36, height: 36 }}
                  />
                  <span>{profile?.username || "Connecting…"}</span>
                </div>
              </div>
            );
          })}

        {showAvatar && <AudioAvatar caller={callerInfo} callType={callType} />}

        {callType === "video" && !cameraOff && (
          <div className="local-pip">
            <div ref={localVideoRef} className="local-video" />
          </div>
        )}
      </div>

      <div
        className={`call-controls ${controlsVisible ? "visible" : "hidden"}`}
      >
        <IconButton onClick={toggleMic}>
          {micMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>

        {callType === "video" && (
          <IconButton onClick={toggleCamera}>
            {cameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        )}

        <IconButton onClick={toggleSpeaker}>
          {speakerMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>

        <IconButton
          onClick={handleEnd}
          sx={{ backgroundColor: "#e53935", color: "#fff" }}
        >
          <CallEndIcon />
        </IconButton>
      </div>
    </div>
  );
}

/* ---------------- Audio Avatar ---------------- */
function AudioAvatar({ caller, callType }) {
  return (
    <div className="audio-avatar">
      <Avatar src={caller?.profile} sx={{ width: 140, height: 140 }} />
      <h2>{caller?.username || "Unknown"}</h2>
      <p>{callType?.toUpperCase()} CALL</p>
    </div>
  );
}
