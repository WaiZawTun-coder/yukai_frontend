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

import Button from "./ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utilities/api";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  onReceiveMessage,
  offReceiveMessage,
  sendMessage,
  emitUpdateReceipt,
  onReceiptUpdate,
  offReceiptUpdate,
} from "@/utilities/socket";

/* ----------------------- Child Components ------------------------- */

const ChatHeader = ({ chatData, onBack, onToggleInfo }) => (
  <div className="chat-header">
    <div className="back-button" onClick={onBack}>
      <WestRoundedIcon style={{ verticalAlign: "middle", fontSize: 20 }} />
    </div>

    <Image
      src={
        chatData?.other_profile_image
          ? `/api/images?url=${chatData.other_profile_image}`
          : `/Images/default-profiles/${chatData?.other_gender}.jpg`
      }
      alt="Profile"
      className="profile-pic"
      width={37}
      height={37}
    />

    <div className="chat-user-info">
      <span className="user-name">{chatData?.other_display_name}</span>
      <span className="last-seen">last seen recently</span>
    </div>

    <div className="action-icon-container">
      <CallRoundedIcon style={{ fontSize: 30 }} className="header-icon" />
      <VideocamRoundedIcon style={{ fontSize: 30 }} className="header-icon" />
      <MoreVertRoundedIcon
        style={{ fontSize: 30 }}
        className="header-icon"
        onClick={onToggleInfo}
      />
    </div>
  </div>
);

const MessageList = ({
  messages,
  currentUserId,
  messageEndRef,
  formatTime,
  onMessageSeen,
}) => {
  return (
    <div className="message-list">
      {messages.map((msg) => (
        <MessageItem
          key={msg.message_id}
          msg={msg}
          currentUserId={currentUserId}
          formatTime={formatTime}
          onMessageSeen={onMessageSeen}
        />
      ))}
      <div ref={messageEndRef} />
    </div>
  );
};

const MessageItem = ({ msg, currentUserId, formatTime, onMessageSeen }) => {
  const ref = useRef(null);
  const hasMarkedRef = useRef(false); // prevent duplicate calls

  useEffect(() => {
    if (!ref.current) return;
    if (msg.sender_user_id === currentUserId || msg.status === "seen") return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || hasMarkedRef.current) return;
        hasMarkedRef.current = true;
        try {
          onMessageSeen(msg.message_id);
        } catch (err) {
          console.error("Update receipt failed", err);
          hasMarkedRef.current = false;
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [msg.message_id, msg.status, currentUserId, onMessageSeen]);

  return (
    <div
      ref={ref}
      className={`message ${
        msg.sender_user_id === currentUserId ? "outgoing" : "incoming"
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

        {msg.plain_text || "Encrypted message"}

        <span className="time">
          {formatTime(msg.sent_at)}
          {msg.sender_user_id === currentUserId &&
            (msg.status === "seen" ? " ✓✓ seen" : " ✓ sent")}
        </span>
      </div>
    </div>
  );
};

const ChatInput = ({ inputText, setInputText, onSend }) => (
  <div className="chat-input-area">
    <AttachFileRoundedIcon className="icon-clip" />
    <input
      type="text"
      placeholder="Message"
      className="chat-input"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSend()}
      autoFocus
    />
    <SentimentSatisfiedAltRoundedIcon className="icon-sticker" />
    <div className="icon-mic" onClick={onSend}>
      {inputText.trim() ? <SendRoundedIcon /> : <MicRoundedIcon />}
    </div>
  </div>
);

const ChatInfoPanel = ({ showInfo, isMobile, chatData, onClose, router }) => (
  <div
    className={`chat-info-panel ${showInfo ? "open" : ""} ${
      isMobile ? "mobile" : "desktop"
    }`}
  >
    <div className="info-header">
      <span>Chat Info</span>
      <button onClick={onClose}>✕</button>
    </div>

    <div className="info-body">
      <Image
        src={
          chatData?.other_profile_image
            ? `/api/images?url=${chatData.other_profile_image}`
            : `/Images/default-profiles/${chatData?.other_gender}.jpg`
        }
        width={90}
        height={90}
        className="info-avatar"
        alt=""
      />
      <h3>{chatData?.other_display_name}</h3>
      <p>@{chatData?.other_username}</p>

      <div className="info-actions">
        <Button onClick={() => router.push(`/${chatData?.other_username}`)}>
          View Profile
        </Button>
        <Button>Mute</Button>
        <Button color="danger" variant="outlined">
          Block
        </Button>
      </div>
    </div>
  </div>
);

/* -------------------------- Main Component ------------------------ */

const ChatView = ({ username }) => {
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

  const chatId = chatData?.chat_id;

  /* -------------------- Helpers -------------------- */

  const scrollToBottom = () =>
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const markMessageDelivered = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.message_id === messageId ? { ...m, status: "delivered" } : m
      )
    );
    if (chatId) emitUpdateReceipt(messageId, chatId, "delivered");
  };

  const markMessageSeen = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.message_id === messageId ? { ...m, status: "seen" } : m
      )
    );
    if (chatId) emitUpdateReceipt(messageId, chatId, "seen");
  };

  const loadChatData = async () => {
    if (!username) return;
    try {
      const resChat = await apiFetch(
        `/api/chat?username=${username}&device_id=${getDeviceId()}`
      );
      console.log(resChat);
      const chat = resChat.data;
      console.log({
        chat,
        url: `/api/chat?username=${username}&device_id=${getDeviceId()}`,
      });
      setChatData(chat);

      if (!chat?.chat_id) return;

      const resParticipants = await apiFetch(
        `/api/chats/participants?chat_id=${
          chat.chat_id
        }&device_id=${getDeviceId()}`
      );
      setChatParticipants(resParticipants.data);

      const resMessages = await apiFetch(
        `/api/chat/get-messages?chat_id=${
          chat.chat_id
        }&device_id=${getDeviceId()}&page=1`
      );

      const decrypted = [];

      for (const message of resMessages.data) {
        const participant = resParticipants.data.find(
          (p) => p.user_id === user.user_id
        );
        if (!participant) continue;

        const device = participant.devices.find(
          (d) => String(d.signed_prekey_id) === String(message.signed_prekey_id)
        );
        if (!device) continue;

        const plainText = await decryptPayload({
          ciphertext: message.cipher_text,
          iv: message.iv,
          sender_signed_prekey_pub: message.sender_signed_prekey_pub,
        });

        decrypted.push({ ...message, plain_text: plainText });
      }

      setMessages(decrypted);
    } catch (err) {
      console.error("Load chat failed", err);
    }
  };

  const setupSocket = () => {
    if (!chatId) return;

    connectSocket();
    joinRoom(username);

    onReceiveMessage(async (msg) => {
      if (msg.recipient_device_id !== getDeviceId()) return;

      try {
        const plainText = await decryptPayload({
          ciphertext: msg.cipher_text,
          iv: msg.iv,
          sender_signed_prekey_pub: msg.sender_signed_prekey_pub,
        });

        setMessages((prev) => [...prev, { ...msg, plain_text: plainText }]);
        markMessageDelivered(msg.message_id);
      } catch (err) {
        console.error("Decrypt failed", err);
      }
    });

    onReceiptUpdate(({ message_id, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.message_id === message_id ? { ...m, status } : m))
      );
    });

    return () => {
      offReceiveMessage();
      offReceiptUpdate();
      if (chatId) leaveRoom(chatId);
      disconnectSocket();
    };
  };

  const handleSend = async () => {
    if (!inputText.trim() || !chatParticipants.length) return;

    const apiPayload = [];
    const outgoingMessages = [];

    for (const participant of chatParticipants) {
      const payloads = await encryptForDevices({
        plainText: inputText.trim(),
        recipientDevices: participant.devices,
      });

      apiPayload.push(
        ...payloads.map((payload) => ({
          cipher_text: payload.ciphertext,
          recipient_device_id: payload.device_id,
          recipient_user_id: participant.user_id,
          iv: payload.iv,
          signed_prekey_id: payload.signed_prekey_id,
          sender_signed_prekey_pub: payload.sender_signed_prekey_pub,
        }))
      );

      payloads.forEach((payload) => {
        outgoingMessages.push({
          chat_id: chatId,
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

    const res = await apiFetch("/api/chat/send-message", {
      method: "POST",
      body: {
        chat_id: chatId,
        message_type: "text",
        reply_to: null,
        payloads: apiPayload,
      },
    });

    if (res.status) {
      outgoingMessages.forEach((message) => {
        sendMessage({
          ...message,
          message_id: res.message_id,
        });
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        message_id: res.message_id,
        chat_id: chatId,
        sender_user_id: user.user_id,
        plain_text: inputText.trim(),
        status: "sent",
        sent_at: new Date().toISOString(),
      },
    ]);

    setInputText("");
  };

  /* -------------------- Effects -------------------- */

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMessages([]);
    loadChatData();
  }, [username]);

  useEffect(() => setupSocket(), [chatId]);

  /* -------------------- Render -------------------- */

  return (
    <div className="chat-wrapper">
      <div className="chat-message-layout">
        <div className="chat-container">
          <ChatHeader
            chatData={chatData}
            onBack={() => router.replace("/chat")}
            onToggleInfo={() => setShowInfo((v) => !v)}
          />
          <MessageList
            messages={messages}
            currentUserId={user.user_id}
            messageEndRef={messageEndRef}
            formatTime={formatTime}
            onMessageSeen={markMessageSeen}
          />
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
          />
        </div>

        <div
          className={`info-backdrop ${showInfo && isMobile ? "show" : ""}`}
          onClick={() => setShowInfo(false)}
        />

        <ChatInfoPanel
          showInfo={showInfo}
          isMobile={isMobile}
          chatData={chatData}
          onClose={() => setShowInfo(false)}
          router={router}
        />
      </div>
    </div>
  );
};

export default ChatView;
