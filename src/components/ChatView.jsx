"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Icons
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

// Contexts & Socket
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utilities/api";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  offReceiveMessage,
  onReceiveMessage,
  sendMessage,
} from "@/utilities/socket";

import Button from "./ui/Button";

/* ------------------------------------------------------------------ */

const ChatView = ({ id }) => {
  const router = useRouter();
  const apiFetch = useApi();

  const { user, getDeviceId, encryptForDevices, decryptPayload } = useAuth();

  const [chatData, setChatData] = useState({});
  const [chatParticipants, setChatParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messageEndRef = useRef(null);

  /* ===================== UI HELPERS ===================== */

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(scrollToBottom, [messages]);

  /* ===================== SCREEN SIZE ===================== */

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ===================== LOAD CHAT ===================== */

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const resChat = await apiFetch(`/api/chat?chat_id=${id}`);
        setChatData(resChat.data);

        const resParticipants = await apiFetch(
          `/api/chats/participants?chat_id=${id}&device_id=${getDeviceId()}`
        );

        // Exclude myself
        const others = resParticipants.data.filter(
          (p) => p.user_id !== user.user_id
        );

        setChatParticipants(others);
      } catch (err) {
        console.error("Load chat failed", err);
      }
    })();
  }, [id]);

  /* ===================== SOCKET ===================== */

  useEffect(() => {
    if (!id) return;

    connectSocket();
    joinRoom(id);

    onReceiveMessage(async (msg) => {
      try {
        // Only decrypt messages for THIS device
        if (msg.recipient_device_id !== getDeviceId()) return;

        const plainText = await decryptPayload({
          ciphertext: msg.cipher_text,
          iv: msg.iv,
          sender_signed_prekey_pub: msg.sender_signed_prekey_pub,
        });

        setMessages((prev) => [
          ...prev,
          {
            ...msg,
            plain_text: plainText,
          },
        ]);
      } catch (err) {
        console.error("Decrypt failed", err);
      }
    });

    return () => {
      offReceiveMessage();
      leaveRoom(id);
      disconnectSocket();
    };
  }, [id]);

  /* ===================== SEND MESSAGE ===================== */

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Encrypt per participant device
    for (const participant of chatParticipants) {
      const payloads = await encryptForDevices({
        plainText: inputText.trim(),
        recipientDevices: participant.devices,
      });

      payloads.forEach((payload) => {
        sendMessage({
          chat_id: id,
          sender_user_id: user.user_id,

          cipher_text: payload.ciphertext,
          iv: payload.iv,

          signed_prekey_id: payload.signed_prekey_id,
          sender_signed_prekey_pub: payload.sender_signed_prekey_pub,

          recipient_device_id: payload.device_id,
          message_type: "text",
          sent_at: new Date().toISOString(),
        });
      });
    }

    // Optimistic UI (plaintext only)
    setMessages((prev) => [
      ...prev,
      {
        message_id: Date.now(),
        chat_id: id,
        sender_user_id: user.user_id,
        plain_text: inputText.trim(),
        sent_at: new Date().toISOString(),
      },
    ]);

    setInputText("");
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="chat-wrapper">
      <div className="chat-message-layout">
        {/* Main Chat */}
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <div
              className="back-button"
              onClick={() => router.replace("/chat")}
            >
              <WestRoundedIcon
                style={{ verticalAlign: "middle", fontSize: 20 }}
              />
            </div>

            <Image
              src={
                chatData?.other_profile_image
                  ? `/api/images?url=${chatData.other_profile_image}`
                  : `/Images/default-profiles/${chatData.other_gender}.jpg`
              }
              alt="Profile"
              className="profile-pic"
              width={37}
              height={37}
            />

            <div className="chat-user-info">
              <span className="user-name">{chatData.other_display_name}</span>
              <span className="last-seen">last seen recently</span>
            </div>

            <div className="action-icon-container">
              <div className="header-icon">
                <CallRoundedIcon style={{ fontSize: 30 }} />
              </div>
              <div className="header-icon">
                <VideocamRoundedIcon style={{ fontSize: 30 }} />
              </div>
              <div
                className="header-icon"
                onClick={() => setShowInfo((v) => !v)}
              >
                <MoreVertRoundedIcon style={{ fontSize: 30 }} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="message-list">
            {messages.map((msg) => (
              <div
                key={msg.message_id}
                className={`message ${
                  msg.sender_user_id === user.user_id ? "outgoing" : "incoming"
                }`}
              >
                <div className="bubble">
                  {msg.reply_message_id && (
                    <div className="reply-bar">
                      <strong>{msg.reply_sender_name}</strong>
                      <br />
                      {msg.reply_cipher_text}
                    </div>
                  )}

                  {msg.plain_text}
                  <span className="time">
                    {formatTime(msg.sent_at)}{" "}
                    {msg.sender_user_id === user.user_id && "✓✓"}
                  </span>
                </div>
              </div>
            ))}

            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="icon-clip">
              <AttachFileRoundedIcon />
            </div>

            <input
              type="text"
              placeholder="Message"
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <div className="icon-sticker">
              <SentimentSatisfiedAltRoundedIcon />
            </div>

            <div className="icon-mic" onClick={handleSend}>
              {inputText.trim() ? <SendRoundedIcon /> : <MicRoundedIcon />}
            </div>
          </div>
        </div>

        {/* Backdrop */}
        <div
          className={`info-backdrop ${showInfo && isMobile ? "show" : ""}`}
          onClick={() => setShowInfo(false)}
        />

        {/* Info Panel */}
        <div
          className={`chat-info-panel ${showInfo ? "open" : ""} ${
            isMobile ? "mobile" : "desktop"
          }`}
        >
          <div className="info-header">
            <span>Chat Info</span>
            <button onClick={() => setShowInfo(false)}>✕</button>
          </div>

          <div className="info-body">
            <Image
              src={
                chatData?.other_profile_image
                  ? `/api/images?url=${chatData.other_profile_image}`
                  : `/Images/default-profiles/${chatData.other_gender}.jpg`
              }
              width={90}
              height={90}
              className="info-avatar"
              alt=""
            />

            <h3>{chatData.other_display_name}</h3>
            <p>@{chatData.other_username}</p>

            <div className="info-actions">
              <Button
                onClick={() => router.push(`/${chatData.other_username}`)}
              >
                View Profile
              </Button>
              <Button>Mute</Button>
              <Button color="danger" variant="outlined">
                Block
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
