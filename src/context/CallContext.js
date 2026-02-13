"use client";

import { useSnackbar } from "@/context/SnackbarContext";
import {
  emitAnswerCall,
  emitRejectCall,
  emitUserJoin,
  emitUserleft,
  offCallUserJoin,
  offCallUserLeft,
  offEndCall,
  offIncomingCall,
  offRejectCall,
  offStopRinging,
  onCallUserJoin,
  onCallUserLeft,
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
  const clientRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });
  const localUidRef = useRef(null);

  const ringtoneRef = useRef(null);
  const snackbarIdRef = useRef(null);

  const { showSnackbar, removeSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const [inCall, setInCall] = useState(false);

  const [roomId, setRoomId] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [channel, setChannel] = useState(null);
  const [callType, setCallType] = useState(null);

  const [callerInfo, setCallerInfo] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [participants, setParticipants] = useState({});

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const [clientReady, setClientReady] = useState(false);

  // -------------------
  // Load Agora SDK
  // -------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (typeof window === "undefined") return;

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(AgoraRTC.LOG_LEVEL_NONE);
      AgoraRTC.disableLogUpload();

      if (!mounted) return;

      AgoraRTCRef.current = AgoraRTC;
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClientReady(true);
    })();

    return () => {
      mounted = false;
      clientRef.current = null;
    };
  }, []);

  // -------------------
  // Remote users subscription
  // -------------------
  useEffect(() => {
    if (!clientReady) return;

    const client = clientRef.current;
    if (!client) return;

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      setRemoteUsers((prev) => ({
        ...prev,
        [user.uid]: {
          ...(prev[user.uid] || {}),
          uid: user.uid,
          audioTrack: user.audioTrack || prev[user.uid]?.audioTrack,
          videoTrack: user.videoTrack || prev[user.uid]?.videoTrack,
        },
      }));

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => {
        const copy = { ...prev };
        delete copy[user.uid];
        return copy;
      });

      setParticipants((prev) => {
        const copy = { ...prev };
        delete copy[user.uid];
        return copy;
      });
    };

    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);

    // Subscribe to any already published users
    client.remoteUsers.forEach(async (user) => {
      if (user.audioTrack) await handleUserPublished(user, "audio");
      if (user.videoTrack) await handleUserPublished(user, "video");
    });

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-left", handleUserLeft);
    };
  }, [clientReady]);

  // -------------------
  // Incoming call UI
  // -------------------
  const stopIncomingUI = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
    if (snackbarIdRef.current) {
      removeSnackbar(snackbarIdRef.current);
      snackbarIdRef.current = null;
    }
  }, [removeSnackbar]);

  const startCall = useCallback(
    async (userInfo, roomId, type = "video") => {
      const client = clientRef.current;
      if (!client || inCall) return;

      stopIncomingUI();
      setCallerInfo(userInfo);

      setRoomId(roomId);

      try {
        const res = await fetch(`/api/agora-token?channel=${roomId}`);
        const { token, uid } = await res.json();
        localUidRef.current = uid;

        await client.join(APP_ID, roomId, token, uid);

        const AgoraRTC = AgoraRTCRef.current;

        if (type === "audio") {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.current.audio = audioTrack;
          await client.publish(audioTrack);
          setCameraOff(true);
        } else {
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks();
          localTracks.current.audio = audioTrack;
          localTracks.current.video = videoTrack;
          await client.publish([audioTrack, videoTrack]);
          setCameraOff(false);
        }

        emitUserJoin({ agoraUid: uid, user: userInfo, roomId });

        setCallType(type);
        setChannel(roomId);
        setInCall(true);
      } catch (err) {
        console.error("Failed to start call", err);
      }
    },
    [inCall, stopIncomingUI]
  );

  const stopCall = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      ["audio", "video"].forEach((type) => {
        localTracks.current[type]?.stop?.();
        localTracks.current[type]?.close?.();
      });

      await client.leave();

      emitUserleft({
        agoraUid: localUidRef.current,
        user: callerInfo,
      });
    } catch (e) {
      console.error(e);
    } finally {
      localTracks.current = { audio: null, video: null };
      setRemoteUsers({});
      setParticipants({});
      setCallerInfo(null);
      setCallType(null);
      setChannel(null);
      setInCall(false);
      setMinimized(false);
    }
  }, [callerInfo]);

  const playLocalVideo = useCallback((container) => {
    const track = localTracks.current.video;
    if (!track || !container) return;
    container.innerHTML = "";
    track.play(container);
  }, []);

  const playRemoteVideo = useCallback(
    (uid, container) => {
      const user = remoteUsers[uid];
      if (!user || !user.videoTrack || !container) return;
      container.innerHTML = "";
      user.videoTrack.play(container);
    },
    [remoteUsers]
  );

  // -------------------
  // Incoming Call socket
  // -------------------
  useEffect(() => {
    const handleIncomingCall = (callData) => {
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.loop = true;
      audio.play().catch(() => {});
      ringtoneRef.current = audio;

      snackbarIdRef.current = showSnackbar({
        title: "Incoming Call",
        persist: true,
        variant: "call",
        message: (
          <div className="call-notification">
            <Image
              src={
                callData.caller.profile_image
                  ? `/api/images?url=${encodeURIComponent(
                      callData.caller.profile_image
                    )}`
                  : "/Images/default-profiles/male.jpg"
              }
              width={50}
              height={50}
              alt=""
            />
            <div>
              <div>{callData.caller.display_name}</div>
              <div>
                {callData.type === "video" ? "Video Call" : "Audio Call"}
              </div>
            </div>
          </div>
        ),
        actions: (
          <div className="snackbar-actions">
            <button onClick={() => answerCall(callData)} className="snackbar-action-btn accept">Accept</button>
            <button onClick={() => rejectCall(callData)} className="snackbar-action-btn reject">Reject</button>
          </div>
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
  }, [showSnackbar, stopIncomingUI]);

  const answerCall = async (callData) => {
    stopIncomingUI();
    await startCall(
      callData.caller,
      callData.roomId,
      callData.type || callData.callType
    );
    emitAnswerCall(callData.callId, callData.caller.user_id);

    if (pathname !== "/chat/call") router.push("/chat/call");
  };

  const rejectCall = (callData) => {
    stopIncomingUI();
    emitRejectCall(callData.callId, callData.caller.user_id);
  };

  // -------------------
  // Participants socket
  // -------------------
  useEffect(() => {
    const handleJoin = ({ agoraUid, user }) => {
      setParticipants((prev) => ({ ...prev, [agoraUid]: user }));
    };
    const handleLeft = ({ agoraUid }) => {
      setParticipants((prev) => {
        const copy = { ...prev };
        delete copy[agoraUid];
        return copy;
      });
    };

    onCallUserJoin(handleJoin);
    onCallUserLeft(handleLeft);

    return () => {
      offCallUserJoin(handleJoin);
      offCallUserLeft(handleLeft);
    };
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
        playRemoteVideo,
        callType,
        answerCall,
        rejectCall,
        toggleMic: () => {
          const track = localTracks.current.audio;
          if (!track) return;
          track.setEnabled(micMuted);
          setMicMuted((p) => !p);
        },
        toggleCamera: async () => {
          const client = clientRef.current;
          const AgoraRTC = AgoraRTCRef.current;
          if (!client || !AgoraRTC) return;

          try {
            // TURN CAMERA OFF
            if (localTracks.current.video) {
              await client.unpublish(localTracks.current.video);
              localTracks.current.video.stop();
              localTracks.current.video.close();
              localTracks.current.video = null;
              setCameraOff(true);
            }
            // TURN CAMERA ON
            else {
              const videoTrack = await AgoraRTC.createCameraVideoTrack();
              localTracks.current.video = videoTrack;

              // Play local preview if needed
              const localContainer = document.querySelector(".local-video");
              if (localContainer) {
                videoTrack.play(localContainer, { fit: "cover" });
              }

              await client.publish(videoTrack);
              setCameraOff(false);
            }
          } catch (err) {
            console.error("Toggle camera error:", err);
          }
        },
        toggleSpeaker: () => {
          Object.values(remoteUsers).forEach((user) => {
            if (!user.prevVolume) user.prevVolume = 100;
            const newVol = speakerMuted ? user.prevVolume : 0;
            user.audioTrack?.setVolume(newVol);
          });
          setSpeakerMuted((p) => !p);
        },
        micMuted,
        cameraOff,
        speakerMuted,
        remoteUsers,
        participants,
        callerInfo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
