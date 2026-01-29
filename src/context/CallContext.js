"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSnackbar } from "@/context/SnackbarContext";
import { onIncomingCall, offIncomingCall, socket } from "@/utilities/socket";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

const CallContext = createContext(null);
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export function CallProvider({ children }) {
  const localTracks = useRef({ audio: null, video: null });
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const [inCall, setInCall] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [channel, setChannel] = useState(null);
  const [callType, setCallType] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    return () => (clientRef.current = null);
  }, []);

  // -------------------
  // Start a call
  // -------------------
  const startCall = useCallback(
    async (roomId, type = "video") => {
      const client = clientRef.current;
      if (!client || inCall) return;

      try {
        const res = await fetch(`/api/agora-token?channel=${roomId}`);
        const data = await res.json();

        await client.join(APP_ID, roomId, data.token, data.uid);
        setCallType(type);

        if (type === "audio") {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.current.audio = audioTrack;
          await client.publish([audioTrack]);
        }

        if (type === "video") {
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks();

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

      await startCall(callData.roomId, callData.type || callData.callType);

      socket.emit("answer-call", {
        callId: callData.callId,
        toUserId: callData.caller.user_id,
      });

      if (window.location.pathname !== "/chat/call") {
        router.push("/chat/call");
      }
    },
    [inCall, router, startCall]
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
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
