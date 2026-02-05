"use client";

import { useSnackbar } from "@/context/SnackbarContext";
import {
  emitAnswerCall,
  emitRejectCall,
  offEndCall,
  offIncomingCall,
  offRejectCall,
  offStopRinging,
  onEndCall,
  onIncomingCall,
  onRejectedCall,
  onStopRinging,
} from "@/utilities/socket";
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

export function CallProvider({ children }) {
  const AgoraRTCRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });

  const { showSnackbar, removeSnackbar } = useSnackbar();
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

  const clientRef = useRef(null);
  const snackbarIdRef = useRef(null);
  const ringtoneRef = useRef(null); // FIX: useRef instead of useState

  // -------------------
  // Load Agora Client
  // -------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (typeof window === "undefined") return;

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(AgoraRTC.LOG_LEVEL_NONE);

      if (!mounted) return;

      AgoraRTCRef.current = AgoraRTC;
      AgoraRTC.disableLogUpload();
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
  // Stop ringtone + snackbar
  // -------------------
  const stopIncomingUI = useCallback(() => {
    // stop ringtone safely
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }

    // remove snackbar safely
    if (snackbarIdRef.current) {
      removeSnackbar(snackbarIdRef.current);
      snackbarIdRef.current = null;
    }
  }, [removeSnackbar]);

  // -------------------
  // Start Call
  // -------------------
  const startCall = useCallback(
    async (userInfo, roomId, type = "video") => {
      stopIncomingUI();

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

          localTracks.current.audio = audioTrack;
          localTracks.current.video = videoTrack;

          await client.publish([audioTrack, videoTrack]);
          setCameraOff(false);
        }

        setChannel(roomId);
        setInCall(true);
        setMinimized(false);

        onRejectedCall(() => {
          stopCall();
          router.back();
        });

        return () => {
          offRejectCall(() => {
            stopCall();
            router.back();
          });
        };
      } catch (err) {
        console.error("Failed to start call:", err);
      }
    },
    [inCall, stopIncomingUI]
  );

  // -------------------
  // Stop Call
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
  // Play Local Video
  // -------------------
  const playLocalVideo = useCallback((container) => {
    const videoTrack = localTracks.current.video;
    if (!videoTrack || !container) return;

    container.innerHTML = "";
    videoTrack.stop();
    videoTrack.play(container);
  }, []);

  // -------------------
  // Answer Call
  // -------------------
  const answerCall = useCallback(
    async (callData) => {
      if (inCall) return;

      stopIncomingUI();

      const userInfo = {
        user_id: callData.caller.user_id,
        username: callData.caller.display_name,
        profile: callData.caller.profile_image,
        gender: callData.caller.gender,
      };

      await startCall(
        userInfo,
        callData.roomId,
        callData.type || callData.callType
      );

      emitAnswerCall(callData.callId, callData.caller.user_id);

      if (pathname !== "/chat/call") {
        router.push("/chat/call");
      }
    },
    [inCall, router, startCall, pathname, stopIncomingUI]
  );

  // -------------------
  // Reject Call
  // -------------------
  const rejectCall = useCallback(
    (callData) => {
      stopIncomingUI();

      emitRejectCall(callData.callId, callData.caller.user_id);

      // socket.emit("reject-call", {
      //   callId: callData.callId,
      //   toUserId: callData.caller.user_id,
      // });
    },
    [stopIncomingUI]
  );

  // -------------------
  // Incoming Call Listener
  // -------------------
  useEffect(() => {
    const handleIncomingCall = (callData) => {
      // stop previous ringtone if exists
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      // create new ringtone
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.loop = true;
      audio.play().catch(() => {});
      ringtoneRef.current = audio;

      const profileImage = callData.caller.profile_image?.trim()
        ? `/api/images?url=${encodeURIComponent(callData.caller.profile_image)}`
        : "/Images/default-profiles/male.jpg";

      snackbarIdRef.current = showSnackbar({
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

    const stopUI = () => stopIncomingUI();

    onIncomingCall(handleIncomingCall);
    onStopRinging(stopUI);
    onRejectedCall(stopUI);
    onEndCall(stopUI);
    return () => {
      offIncomingCall(handleIncomingCall);
      offStopRinging(stopUI);
      offRejectCall(stopUI);
      offEndCall(stopUI);
    };
  }, [showSnackbar, answerCall, rejectCall, stopIncomingUI]);

  // -------------------
  // Toggle Mic
  // -------------------
  const toggleMic = useCallback(() => {
    const audioTrack = localTracks.current.audio;
    if (!audioTrack) return;

    audioTrack.setEnabled(micMuted);
    setMicMuted((prev) => !prev);
  }, [micMuted]);

  // -------------------
  // Toggle Camera
  // -------------------
  const toggleCamera = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    const videoTrack = localTracks.current.video;

    if (videoTrack) {
      await client.unpublish(videoTrack);
      videoTrack.stop();
      videoTrack.close();
      localTracks.current.video = null;
      setCameraOff(true);
      return;
    }

    const AgoraRTC = AgoraRTCRef.current;
    const newVideoTrack = await AgoraRTC.createCameraVideoTrack();

    localTracks.current.video = newVideoTrack;
    await client.publish(newVideoTrack);
    setCameraOff(false);
  }, []);

  // -------------------
  // Toggle Speaker
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
  }, [speakerMuted]);

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
