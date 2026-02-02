"use client";

import { useSnackbar } from "@/context/SnackbarContext";
import { offIncomingCall, onIncomingCall, socket } from "@/utilities/socket";
// import AgoraRTC from "agora-rtc-sdk-ng";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const CallContext = createContext(null);
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

// AgoraRTC.setLogLevel(AgoraRTC.LOG_LEVEL_NONE);

const CALL_STATE = {
  calling: "Calling",
  ringing: "Ringing",
  connecting: "Connecting",
  connected: "Connected",
  ended: "Ended",
};

export function CallProvider({ children }) {
  const AgoraRTCRef = useRef(null);

  const localTracks = useRef({ audio: null, video: null });
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const [inCall, setInCall] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [channel, setChannel] = useState(null);
  const [callType, setCallType] = useState(null);

  const [remoteUserInfo, setRemoteUser] = useState(null);

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const [ringtone, setRingtone] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (typeof window === "undefined") return;

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      AgoraRTC.setLogLevel(AgoraRTC.LOG_LEVEL_NONE);

      if (!mounted) return;

      AgoraRTCRef.current = AgoraRTC;
      clientRef.current = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
    })();

    return () => {
      mounted = false;
      clientRef.current = null;
    };
  }, []);

  // -------------------
  // Start a call
  // -------------------
  const startCall = useCallback(
    async (userInfo, roomId, type = "video") => {
      const client = clientRef.current;
      if (!client || inCall) return;

      setRemoteUser(userInfo);

      try {
        const res = await fetch(`/api/agora-token?channel=${roomId}`);
        const data = await res.json();

        await client.join(APP_ID, roomId, data.token, data.uid);
        setCallType(type);

        const AgoraRTC = AgoraRTCRef.current;

        if (type === "audio") {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.current.audio = audioTrack;
          await client.publish([audioTrack]);
          setCameraOff(true);
        }

        if (type === "video") {
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks();
          setCameraOff(false);

          console.log("🎥 Local video track:", videoTrack);

          localTracks.current.audio = audioTrack;
          localTracks.current.video = videoTrack;
          await client.publish([audioTrack, videoTrack]);
        }

        setChannel(roomId);
        setInCall(true);
        setMinimized(false);
      } catch (err) {
        console.error("Failed to start call:", err);
      }
    },
    [inCall]
  );

  // -------------------
  // Stop a call
  // -------------------
  const stopCall = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      localTracks.current.audio?.stop();
      localTracks.current.audio?.close();
      localTracks.current.video?.stop();
      localTracks.current.video?.close();
      await client.leave();
    } catch (err) {
      console.error(err);
    } finally {
      localTracks.current.audio = null;
      localTracks.current.video = null;
      setCallType(null);
      setInCall(false);
      setMinimized(false);
      setChannel(null);
    }
  }, []);

  // -------------------
  // Play local video
  // -------------------
  const playLocalVideo = useCallback((container) => {
    const videoTrack = localTracks.current.video;
    if (!videoTrack || !container) return;

    container.innerHTML = "";
    videoTrack.stop();
    videoTrack.play(container);
  }, []);

  // -------------------
  // Answer incoming call
  // -------------------
  const answerCall = useCallback(
    async (callData) => {
      if (inCall) return;

      const userInfo = {
        username: callData.caller.display_name,
        profile: callData.caller.profile_image,
        gender: callData.caller.gender,
      };

      await startCall(
        userInfo,
        callData.roomId,
        callData.type || callData.callType
      );

      socket.emit("answer-call", {
        callId: callData.callId,
        toUserId: callData.caller.user_id,
      });

      if (pathname !== "/chat/call") {
        router.push("/chat/call");
      }
    },
    [inCall, router, startCall, pathname]
  );

  // -------------------
  // Reject incoming call
  // -------------------
  const rejectCall = useCallback((callData) => {
    socket.emit("reject-call", {
      callId: callData.callId,
      toUserId: callData.caller.user_id,
    });
  }, []);

  // -------------------
  // Incoming call notifications
  // -------------------
  useEffect(() => {
    const handleIncomingCall = (callData) => {
      if (!ringtone) {
        const audio = new Audio("/sounds/ringtone.mp3");
        console.log("Audio object created:", audio, typeof audio);
        if (!(audio instanceof HTMLAudioElement)) {
          console.error("Audio is not an HTMLAudioElement:", audio);
          return;
        }
        audio.loop = true;
        audio.addEventListener("canplaythrough", () => {
          audio.play().catch((err) => {
            console.error("Ringtone play failed:", err);
            if (Notification.permission === "granted") {
              new Notification("Incoming Call", {
                body: `From ${callData.fromUser}`,
              });
            } else {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification("Incoming Call", {
                    body: `From ${callData.fromUser}`,
                  });
                }
              });
            }
          });
        });
        audio.addEventListener("error", (e) => {
          console.error("Audio load error:", e);
        });
        audio.load();
        setRingtone(audio);
      }

      const profileImage = callData.caller.profile_image?.trim()
        ? `/api/images?url=${encodeURIComponent(callData.caller.profile_image)}`
        : "/Images/default-profiles/male.jpg";

      showSnackbar({
        title: "Incoming Call",
        message: (
          <div className="call-notification">
            <Image
              src={profileImage}
              alt={callData.caller.display_name}
              width={50}
              height={50}
              className="call-avatar"
            />
            <div className="call-body">
              <div className="call-username">
                {callData.caller.display_name}
              </div>
              <div className="call-text">
                {callData.type === "video" ? "Video Call" : "Audio Call"}
              </div>
            </div>
          </div>
        ),
        variant: "call",
        persist: true,
        actions: (
          <>
            <button className="btn-accept" onClick={() => answerCall(callData)}>
              Accept
            </button>
            <button className="btn-reject" onClick={() => rejectCall(callData)}>
              Reject
            </button>
          </>
        ),
      });
    };

    onIncomingCall(handleIncomingCall);
    return () => offIncomingCall(handleIncomingCall);
  }, [showSnackbar, answerCall, rejectCall, pathname]);

  // -------------------
  // Toggle Microphone
  // -------------------
  const toggleMic = useCallback(() => {
    const audioTrack = localTracks.current.audio;
    if (!audioTrack) return;

    audioTrack.setEnabled(micMuted); // reverse
    setMicMuted((prev) => !prev);

    console.log("🎤 Mic:", micMuted ? "ON" : "OFF");
  }, [micMuted]);

  // -------------------
  // Toggle Camera
  // -------------------
  const toggleCamera = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    const videoTrack = localTracks.current.video;

    // CAMERA OFF
    if (videoTrack) {
      try {
        await client.unpublish(videoTrack);

        videoTrack.stop();
        videoTrack.close();

        localTracks.current.video = null;
        setCameraOff(true);

        console.log("📷 Camera OFF");
      } catch (err) {
        console.error("Camera off failed:", err);
      }
      return;
    }

    // CAMERA ON
    try {
      const AgoraRTC = AgoraRTCRef.current;
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack();

      localTracks.current.video = newVideoTrack;

      await client.publish(newVideoTrack);
      setCameraOff(false);

      console.log("📷 Camera ON");
    } catch (err) {
      console.error("Camera on failed:", err);
    }
  }, []);

  // -------------------
  // Toggle Speaker (remote audio)
  // -------------------
  const toggleSpeaker = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    client.remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(speakerMuted ? 100 : 0);
      }
    });

    setSpeakerMuted((prev) => !prev);
    console.log("🔊 Speaker:", speakerMuted ? "ON" : "OFF");
  }, [speakerMuted]);

  const mutedUsersRef = useRef(new Set());

  const toggleUserSpeaker = useCallback((uid) => {
    const client = clientRef.current;
    if (!client) return;

    const user = client.remoteUsers.find((u) => u.uid === uid);
    if (!user || !user.audioTrack) return;

    if (mutedUsersRef.current.has(uid)) {
      user.audioTrack.setVolume(100);
      mutedUsersRef.current.delete(uid);
    } else {
      user.audioTrack.setVolume(0);
      mutedUsersRef.current.add(uid);
    }

    console.log(
      "🔇 User",
      uid,
      mutedUsersRef.current.has(uid) ? "muted" : "unmuted"
    );
  }, []);

  return (
    <CallContext.Provider
      value={{
        clientRef,
        localTracks,
        inCall,
        minimized,
        setMinimized,
        startCall,
        stopCall,
        channel,
        playLocalVideo,
        callType,
        answerCall,
        rejectCall,
        toggleMic,
        toggleCamera,
        toggleSpeaker,
        toggleUserSpeaker,

        micMuted,
        cameraOff,
        speakerMuted,
        remoteUserInfo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
