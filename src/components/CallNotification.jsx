import { useNotification } from "../context/NotificationContext";
import { useEffect, useState } from "react";

export const CallNotifications = () => {
  const { calls, removeCall } = useNotification();
  const [ringtones, setRingtones] = useState({}); // Map of call.id to audio instance

  useEffect(() => {
    calls.forEach((call) => {
      // Play ringtone for this call if not already playing
      if (!ringtones[call.id]) {
        const audio = new Audio("/sounds/ringtone.mp3");
        audio.loop = true;
        try {
          audio.play();
        } catch (err) {
          console.error("Ringtone play failed:", err);
        }
        setRingtones((prev) => ({ ...prev, [call.id]: audio }));
      }
    });

    // Stop ringtones for removed calls
    Object.keys(ringtones).forEach((callId) => {
      if (!calls.some((call) => call.id === callId)) {
        console.log("Stopping ringtone for call:", callId);
        ringtones[callId]?.pause();
        setRingtones((prev) => {
          const newRingtones = { ...prev };
          delete newRingtones[callId];
          return newRingtones;
        });
      }
    });
  }, [calls, ringtones]);

  // Cleanup on unmount: Stop all ringtones
  useEffect(() => {
    return () => {
      Object.values(ringtones).forEach((audio) => audio?.pause());
    };
  }, [ringtones]);

  return null; // No UI, just audio handling
};
