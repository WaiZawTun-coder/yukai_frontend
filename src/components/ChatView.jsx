"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Icons
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";

import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { useApi } from "@/utilities/api";
import {
  checkUserOnline,
  emitStopTyping,
  emitTypingMessage,
  emitUpdateReceipt,
  joinRoom,
  leaveRoom,
  makeCall,
  offEndCall,
  offReceiptUpdate,
  offReceiveMessage,
  offTypingMessage,
  onCheckUserOnline,
  onEndCall,
  onReceiptUpdate,
  onReceiveMessage,
  onTypingMessage,
  sendMessage,
  socket,
} from "@/utilities/socket";
import Button from "./ui/Button";
import { useBusy } from "@/context/BusyContext";
import Modal from "./ui/Modal";
import TextField from "./ui/TextField";

/* ----------------------- Child Components ------------------------- */

const ChatHeader = ({
  chatData,
  onBack,
  onToggleInfo,
  handleCall,
  isOnline,
  typingUser,
  lastSeen,
  isCalleeBusy,
}) => (
  <div className="chat-header">
    <div className="back-button" onClick={onBack}>
      <WestRoundedIcon style={{ verticalAlign: "middle", fontSize: 20 }} />
    </div>

    <div className="chat-avatar">
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
      {isOnline && <span className="online-dot" />}
    </div>

    <div className="chat-user-info">
      <span className="user-name">
        {chatData.type === "group"
          ? chatData?.chat_name
          : chatData?.other_display_name}
      </span>
      <span className="last-seen">
        {typingUser ? "Typing..." : isOnline ? "online" : lastSeen}
      </span>
    </div>

    <div className="action-icon-container">
      <button
        className="chat-header-button"
        onClick={handleCall.handleAudioCall}
        disabled={isCalleeBusy}
      >
        <CallRoundedIcon style={{ fontSize: 30 }} className="header-icon" />
      </button>
      <button
        className="chat-header-button"
        onClick={handleCall.handleVideoCall}
        disabled={isCalleeBusy}
      >
        <VideocamRoundedIcon style={{ fontSize: 30 }} className="header-icon" />
      </button>
      <button className="chat-header-button" onClick={onToggleInfo}>
        <MoreVertRoundedIcon style={{ fontSize: 30 }} className="header-icon" />
      </button>
    </div>
  </div>
);

const MessageList = ({
  messages,
  currentUserId,
  messageEndRef,
  formatTime,
  onMessageSeen,
  chatType,
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
          chatType={chatType}
        />
      ))}
      <div ref={messageEndRef} />
    </div>
  );
};

const MessageItem = ({
  msg,
  currentUserId,
  formatTime,
  onMessageSeen,
  chatType,
}) => {
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
  }, [
    msg.message_id,
    msg.status,
    currentUserId,
    onMessageSeen,
    msg.sender_user_id,
  ]);

  return (
    <div
      ref={ref}
      className={`message ${
        msg.sender_user_id === currentUserId ? "outgoing" : "incoming"
      }`}
    >
      {msg.sender_user_id !== currentUserId && chatType == "group" && (
        <Image
          src={
            msg.profile_image
              ? `/api/images?url=${msg.profile_image}`
              : `/Images/default-profiles/${msg.gender}.jpg`
          }
          alt={msg.display_name}
          width={40}
          height={40}
          className="msg-sender-image"
        />
      )}
      <div className="bubble">
        {msg.sender_user_id !== currentUserId && chatType == "group" && (
          <span className="sender-name">{msg.display_name}</span>
        )}
        {/* <br /> */}
        {msg.reply_message_id && (
          <div className="reply-bar">
            <strong>{msg.reply_sender_name}</strong>
            <br />
            {msg.reply_cipher_text}
          </div>
        )}

        <span className="message-content">
          {msg.plain_text || "Encrypted message"}
        </span>

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

const ChatInfoPanel = ({
  showInfo,
  isMobile,
  chatData,
  onClose,
  router,
  handleShowMembersModal,
  handleShowFriendsModal,
}) => (
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
      <h3>
        {chatData.type === "group"
          ? chatData.chat_name
          : chatData?.other_display_name}
      </h3>
      {chatData.type !== "group" && <p>@{chatData?.other_username}</p>}

      <div className="info-actions">
        {chatData.type !== "group" && (
          <Button onClick={() => router.push(`/${chatData?.other_username}`)}>
            View Profile
          </Button>
        )}
        {chatData.type === "group" && (
          <>
            <Button onClick={handleShowMembersModal}>View Members</Button>
            <Button onClick={handleShowFriendsModal}>Add Members</Button>
          </>
        )}
        <Button>Mute</Button>
        <Button color="danger" variant="outlined">
          {chatData.type === "group" ? "Leave" : "Block"}
        </Button>
      </div>
    </div>
  </div>
);

/* -------------------------- Main Component ------------------------ */

const ChatView = ({ username, type = "private", group_id = null }) => {
  const router = useRouter();
  const apiFetch = useApi();
  const { startCall, stopCall } = useCall();
  const { isUserBusy } = useBusy();

  const { user, getDeviceId, encryptForDevices, decryptPayload } = useAuth();

  const [chatData, setChatData] = useState({});
  const [chatParticipants, setChatParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({
    online: false,
    lastSeen: null,
  });

  const [searchMembersValue, setSearchMembersValue] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const [searchFriendsValue, setSearchFriendsValue] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const [selected, setSelected] = useState(new Set());

  const messageEndRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  const chatId = chatData?.chat_id;

  /* -------------------- Helpers -------------------- */

  const scrollToBottom = () =>
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const formatTime = (time, { utc = false } = {}) => {
    if (!time) return "";

    // Normalize "YYYY-MM-DD HH:mm:ss" → ISO
    const iso = time.replace(" ", "T");

    const date = utc
      ? new Date(iso + "Z") // force UTC
      : new Date(iso); // local time

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markMessageDelivered = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.message_id === messageId ? { ...m, status: "delivered" } : m
      )
    );
    if (chatId) emitUpdateReceipt(messageId, chatId, "delivered");
  };

  const markMessageSeen = async (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.message_id === messageId ? { ...m, status: "seen" } : m
      )
    );
    const res = await apiFetch(`/api/chat/update-receipt`, {
      method: "POST",
      body: { message_id: messageId, status: "seen" },
    });
    if (chatId) emitUpdateReceipt(messageId, chatId, "seen");
  };

  function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp; // difference in ms

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }

  const loadChatData = async () => {
    if (
      (!username && type !== "group") ||
      (type == "group" && group_id == null)
    )
      return;
    try {
      const resChat = await apiFetch(
        type !== "group"
          ? `/api/chat?username=${username}&device_id=${getDeviceId()}`
          : `/api/get-group-chat?chat_id=${group_id}&device_id=${getDeviceId()}`
      );
      const chat = resChat.data;
      checkUserOnline(String(chat.other_user_id));

      setChatData(chat);

      if (!chat?.chat_id) return;

      const resParticipants = await apiFetch(
        `/api/chats/participants?chat_id=${
          chat.chat_id
        }&device_id=${getDeviceId()}`
      );
      setChatParticipants(resParticipants.data);
      setFilteredMembers(resParticipants.data);

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

  const handleTyping = (value) => {
    setInputText(value);

    emitTypingMessage(chatId, user.user_id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(chatId, user.user_id);
    }, 1500);
  };

  useEffect(() => {
    const handleOnline = ({ userId }) => {
      if (String(userId) === String(chatData.other_user_id)) {
        setOnlineStatus({ online: true, lastSeen: null });
      }
    };

    const handleOffline = ({ userId, lastSeen }) => {
      if (String(userId) === String(chatData.other_user_id)) {
        setOnlineStatus({
          online: false,
          lastSeen: timeAgo(lastSeen),
        });
      }
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);

    return () => {
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
    };
  }, [chatData?.other_user_id]);

  useEffect(() => {
    const handleStatus = ({ online, lastSeen }) => {
      setOnlineStatus({
        online,
        lastSeen: lastSeen ? timeAgo(lastSeen) : null,
      });
    };

    onCheckUserOnline(handleStatus);

    return () => {
      socket.off("user-status", handleStatus);
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;

    joinRoom(chatId);

    const handleReceiveMessage = async (msg) => {
      if (msg.recipient_device_id !== getDeviceId()) return;

      const plainText = await decryptPayload({
        ciphertext: msg.cipher_text,
        iv: msg.iv,
        sender_signed_prekey_pub: msg.sender_signed_prekey_pub,
      });

      setMessages((prev) => [...prev, { ...msg, plain_text: plainText }]);
      markMessageDelivered(msg.message_id);
    };

    const handleReceiptUpdate = ({ message_id, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.message_id === message_id ? { ...m, status } : m))
      );
    };

    onReceiveMessage(handleReceiveMessage);
    onReceiptUpdate(handleReceiptUpdate);

    return () => {
      offReceiveMessage(handleReceiveMessage);
      offReceiptUpdate(handleReceiptUpdate);
      leaveRoom(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    window.__ACTIVE_CHAT_ID__ = chatId;
    return () => (window.__ACTIVE_CHAT_ID__ = null);
  }, [chatId]);

  useEffect(() => {
    const handleTyping = ({ chatId: incomingChatId, userId, typing }) => {
      if (incomingChatId !== chatId) return;

      if (typing) {
        setTypingUser(userId);

        setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
      }
    };

    onTypingMessage(handleTyping);

    return () => {
      offTypingMessage(handleTyping);
    };
  }, [chatId]);

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
          profile_image: user.profile_image,
          gender: user.gender,
          display_name: user.display_name,
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

    // const res = { status: true, message_id: 1 };

    const targetParticipants = chatParticipants
      .map((participant) => {
        if (participant.user_id != user.user_id) return participant.user_id;
      })
      .filter((d) => d);

    if (res.status) {
      outgoingMessages.forEach((message) => {
        sendMessage({
          ...message,
          message_id: res.message_id,
          participants: targetParticipants,
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

  useEffect(() => {
    const update = () => {
      setFilteredMembers(
        chatParticipants.filter((p) =>
          p.display_name
            .toLowerCase()
            .includes(searchMembersValue.toLowerCase())
        )
      );
    };
    update();
  }, [chatParticipants, searchMembersValue]);

  useEffect(() => {
    // if (showFriendsModal) {
    if (true) {
      const getFriends = async () => {
        const res = await apiFetch(`/api/get-friends`);
        let allFriends = res.data;
        let curPage = res.page + 1;
        const total_pages = res.total_pages;

        while (curPage <= total_pages) {
          const friendData = await apiFetch(`/api/get-friends?page=${curPage}`);
          allFriends = [...allFriends, ...friendData.data];
        }

        setFriendsList(allFriends);
      };
      getFriends();
    }
  }, [apiFetch, showFriendsModal]);

  useEffect(() => {
    const update = () => {
      const participantsId = new Set(
        chatParticipants.map((p) => String(p.user_id))
      );

      const search = searchFriendsValue.toLowerCase();

      const value = friendsList.filter((f) => {
        const name = (f.display_name || "").toLowerCase();

        return name.includes(search) && !participantsId.has(String(f.user_id));
      });

      setFilteredFriends(
        friendsList.filter((f) => {
          const name = (f.display_name || "").toLowerCase();

          return (
            name.includes(search) && !participantsId.has(String(f.user_id))
          );
        })
      );
    };

    update();
  }, [chatParticipants, friendsList, searchFriendsValue]);

  /* -------------------- Call Helpers -------------------- */
  const createRoomId = (caller, callee, chatId) => {
    if (!Array.isArray(callee)) callee = [callee];

    // Sort callees to keep deterministic order
    const sortedCallees = callee.sort((a, b) => a.user_id - b.user_id);

    // Combine IDs only to shorten length
    const idsPart = [
      caller.user_id,
      ...sortedCallees.map((c) => c.user_id),
    ].join("_");

    // Optional: Use a hash for extra uniqueness and shorter length
    const baseString = `${caller.username}_${sortedCallees
      .map((c) => c.username)
      .join("_")}_${chatId}`;
    const hash = Array.from(baseString).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    ); // simple hash

    return `room_${idsPart}_${hash}`.slice(0, 64); // ensure max 64 chars
  };

  const handleVideoCall = async () => {
    // const callee = chatData.
    const roomId = createRoomId(
      { username: user.username, user_id: user.user_id },
      chatParticipants,
      chatData.chat_id
    );

    const userInfo = {
      user_id: chatData.other_user_id,
      username: chatData.other_display_name,
      profile: chatData.other_profile_image,
    };

    await startCall(userInfo, roomId, "video");
    console.log(
      "Start Call",
      chatParticipants.map((p) => p.user_id)
    );

    makeCall({
      toUsers: chatParticipants.map((p) => p.user_id),
      fromUserId: user.user_id,
      callType: "video",
      caller: {
        user_id: user.user_id,
        username: user.username,
        profile_image: user.profile_image,
        gender: user.gender,
        display_name: user.display_name,
      },
      roomId,
    });

    onEndCall(() => {
      stopCall();
    });

    router.push("/chat/call");

    return () => {
      offEndCall(() => {
        stopCall();
      });
    };
  };

  const handleAudioCall = async () => {
    const roomId = createRoomId(
      { username: user.username, user_id: user.user_id },
      {
        // todo: make real time for rejecting and ending call
        username: chatData.other_username,
        user_id: chatData.other_user_id,
      },
      chatData.chat_id
    );

    const userInfo = {
      user_id: chatData.other_user_id,
      username: chatData.other_display_name,
      profile: chatData.other_profile_image,
    };

    await startCall(userInfo, roomId, "audio");

    makeCall({
      toUsers: chatParticipants.map((p) => p.user_id),
      fromUserId: user.user_id,
      callType: "audio",
      caller: {
        user_id: user.user_id,
        username: user.username,
        profile_image: user.profile_image,
        gender: user.gender,
        display_name: user.display_name,
      },
      roomId,
    });

    router.push("/chat/call");
  };

  /* -------------------- handle functions -------------------- */
  const handleShowMembersModal = () => {
    setShowMembersModal(true);
  };

  const handleShowFriendsModal = () => {
    setShowFriendsModal(true);
  };

  const toggleUser = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="chat-wrapper">
      <div className="chat-message-layout">
        <div className="chat-container">
          <ChatHeader
            chatData={chatData}
            onBack={() => router.replace("/chat")}
            onToggleInfo={() => setShowInfo((v) => !v)}
            handleCall={{ handleVideoCall, handleAudioCall }}
            isOnline={onlineStatus.online}
            typingUser={typingUser}
            lastSeen={onlineStatus.lastSeen}
            isCalleeBusy={
              chatData.type === "private"
                ? isUserBusy(chatData.other_user_id)
                : false
            }
          />

          <MessageList
            messages={messages}
            currentUserId={user.user_id}
            messageEndRef={messageEndRef}
            formatTime={formatTime}
            onMessageSeen={markMessageSeen}
            chatType={chatData.type}
          />
          <ChatInput
            inputText={inputText}
            setInputText={handleTyping}
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
          handleShowMembersModal={handleShowMembersModal}
          handleShowFriendsModal={handleShowFriendsModal}
        />
      </div>
      <Modal
        isOpen={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          setSearchMembersValue("");
        }}
        title={"Chat Members"}
      >
        <input
          placeholder="Search Members"
          value={searchMembersValue}
          onChange={(e) => {
            setSearchMembersValue(e.target.value);
          }}
        />

        <div className="member-list">
          {filteredMembers.map((member) => (
            <div key={member.user_id} className="member-item">
              <Image
                src={
                  member.profile_image
                    ? `/api/images?url=${member.profile_image}`
                    : `/Images/default-profiles/${member.gender}.jpg`
                }
                alt={member.display_name}
                width={40}
                height={40}
              />
              {member.display_name}
            </div>
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={showFriendsModal}
        onClose={() => {
          setShowFriendsModal(false);
          setSearchFriendsValue("");
          setSelected(new Set());
        }}
        title="Add Members"
      >
        <input
          placeholder="Search Friends"
          value={searchFriendsValue}
          onChange={(e) => {
            setSearchFriendsValue(e.target.value);
          }}
        />

        <div className="member-list">
          {filteredFriends.map((friend) => (
            <div
              key={friend.user_id}
              className={`user-row ${
                selected.has(friend.user_id) ? "selected" : ""
              }`}
              onClick={() => toggleUser(friend.user_id)}
            >
              <Image
                src={
                  friend.profile_image
                    ? `/api/images?url=${friend.profile_image}`
                    : `/Images/default-profiles/${friend.gender}.jpg`
                }
                alt={friend.display_name}
                width={40}
                height={40}
              />
              {friend.display_name}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <Button
            onClick={() => {
              setShowFriendsModal(false);
              setSearchFriendsValue("");
              setSelected(new Set());
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              alert("Wire add members");
              const payload = {
                chat_id: chatData.chat_id,
                members: [...selected],
              };

              const res = await apiFetch("/api/chats/add-participants", {
                method: "POST",
                body: payload,
              });

              if (res.status) {
                const resParticipants = await apiFetch(
                  `/api/chats/participants?chat_id=${
                    chat.chat_id
                  }&device_id=${getDeviceId()}`
                );

                setChatParticipants(resParticipants.data);
              }
            }}
          >
            Add
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChatView;

// TODO: show participants on chat detail
