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

import {
  endCall,
  onEndCall,
  offEndCall,
  onRejectedCall,
  onCallUserJoin,
  onCallUserOffline,
  offRejectCall,
  offCallUserJoin,
  offCallUserOffline,
  onUserBusy,
  offUserBusy,
} from "@/utilities/socket";

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
    callerInfo,
    playRemoteVideo,
  } = useCall();

  const router = useRouter();
  const localVideoRef = useRef(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const inactivityTimerRef = useRef(null);

  const [callStatus, setCallStatus] = useState("calling");
  // calling | ringing | connecting | connected | busy | no-answer

  /* ---------------- End Call from socket ---------------- */
  useEffect(() => {
    const handleEnd = () => {
      if (callType !== "group") {
        stopCall();
        router.back();
      }
    };

    onEndCall(handleEnd);
    return () => offEndCall(handleEnd);
  }, [stopCall, router, callType]);

  useEffect(() => {
    const handleReject = () => setCallStatus("busy");
    const handleConnecting = () => setCallStatus("conneting");
    const handleOffline = () => setCallStatus("offline");
    const handleBusy = () => setCallStatus("busy");

    onRejectedCall(handleReject);
    onCallUserJoin(handleConnecting);
    onCallUserOffline(handleOffline);
    onUserBusy(handleBusy);

    return () => {
      offRejectCall(handleReject);
      offCallUserJoin(handleConnecting);
      offCallUserOffline(handleOffline);
      offUserBusy(handleBusy);
    };
  }, []);

  useEffect(() => {
    const remoteCount = Object.keys(remoteUsers).length;

    if (remoteCount > 0) {
      setCallStatus("connected");
    }
  }, [remoteUsers]);

  useEffect(() => {
    if (callStatus === "calling") {
      const timer = setTimeout(() => {
        setCallStatus("no-answer");
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [callStatus]);

  useEffect(() => {
    if (
      callStatus === "busy" ||
      callStatus === "no-answer" ||
      callStatus === "offline"
    ) {
      setTimeout(() => {
        stopCall();
        router.back();
      }, 2000);
    }
  }, [callStatus, router, stopCall]);

  /* ---------------- Local video ---------------- */
  useEffect(() => {
    const el = localVideoRef.current;
    const track = localTracks.current?.video;

    if (!inCall || !track || !el) return;

    el.innerHTML = "";
    track.play(el, { fit: "cover" });

    return () => {
      el.innerHTML = "";
    };
  }, [inCall, cameraOff, localTracks]);

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
      INACTIVITY_TIMEOUT,
    );
  }, []);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () =>
      events.forEach((e) =>
        window.removeEventListener(e, resetInactivityTimer),
      );
  }, [resetInactivityTimer]);

  /* ---------------- Actions ---------------- */
  const handleEnd = () => {
    if (callerInfo?.user_id) {
      endCall(callerInfo.user_id);
    }
    stopCall();
    router.back();
  };

  if (callStatus !== "connected") {
    return (
      <div className="waiting-container">
        <div className="waiting-screen">
          <Avatar src={callerInfo?.profile} sx={{ width: 140, height: 140 }} />
          <h2>{callerInfo?.username || "Unknown"}</h2>

          {callStatus === "calling" && <p>Calling...</p>}
          {callStatus === "ringing" && <p>Ringing...</p>}
          {callStatus === "connecting" && <p>Connecting...</p>}
          {callStatus === "busy" && <p>User is busy</p>}
          {callStatus === "no-answer" && <p>No answer</p>}

          <IconButton
            onClick={handleEnd}
            sx={{ backgroundColor: "#e53935", color: "#fff", mt: 3 }}
          >
            <CallEndIcon />
          </IconButton>
        </div>
      </div>
    );
  }

  if (!inCall) return null;

  const remoteUids = Object.keys(remoteUsers);
  const showAvatar = callType === "audio";

  const totalParticipants =
    callType === "video"
      ? Object.keys(remoteUsers).length // include local
      : 1;

  const columns = Math.ceil(Math.sqrt(totalParticipants));

  return (
    <div className="call-root">
      <div
        className="video-stage grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {!showAvatar &&
          remoteUids.map((uid) => (
            <RemoteTile
              key={uid}
              uid={uid}
              user={remoteUsers[uid]}
              profile={participants[uid]}
              playRemoteVideo={playRemoteVideo}
            />
          ))}

        {showAvatar && <AudioAvatar caller={callerInfo} callType={callType} />}

        {callType === "video" && (
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

/* ---------------- Remote Video Tile ---------------- */
function RemoteTile({ uid, user, profile, playRemoteVideo }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (user?.videoTrack) {
      containerRef.current.innerHTML = "";
      user.videoTrack.play(containerRef.current);
    }
  }, [user?.videoTrack]);

  useEffect(() => {
    const track = user?.videoTrack;
    const container = containerRef.current;
    if (!container) return;

    // Clear if track is removed
    if (!track) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = "";
    track.play(container);

    const handleState = () => {
      if (container) track.play(container);
    };

    track.on("track-updated", handleState);

    return () => {
      track?.off("track-updated", handleState);
    };
  }, [user?.videoTrack]);

  useEffect(() => {
    user?.audioTrack?.play();
  }, [user?.audioTrack]);

  return (
    <div
      ref={containerRef}
      className="remote-video"
      style={{ width: "100%", height: "100%" }}
    />
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
