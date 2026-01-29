import { useNotification } from "../context/NotificationContext";
import { useEffect, useState } from "react";

export const CallNotifications = ({ socket }) => {
  const { calls, removeCall } = useNotification();
  const [activeRingtone, setActiveRingtone] = useState(null);

  useEffect(() => {
    calls.forEach((call) => {
      // Play ringtone
      if (!activeRingtone) {
        const audio = new Audio("/ringtone.mp3");
        audio.loop = true;
        audio.play();
        setActiveRingtone(audio);
      }

      // In-app popup
      const popup = document.createElement("div");
      popup.className = "call-popup";
      popup.innerHTML = `
        <p>Incoming call from <strong>${call.fromUser}</strong></p>
        <button class="accept-call">Accept</button>
        <button class="decline-call">Decline</button>
      `;
      document.body.appendChild(popup);

      popup.querySelector(".accept-call").onclick = () => {
        activeRingtone?.pause();
        socket.emit("accept-call", { callId: call.callId });
        popup.remove();
        removeCall(call.id);
      };

      popup.querySelector(".decline-call").onclick = () => {
        activeRingtone?.pause();
        socket.emit("decline-call", { callId: call.callId });
        popup.remove();
        removeCall(call.id);
      };
    });
  }, [calls, socket, removeCall, activeRingtone]);

  return null;
};
