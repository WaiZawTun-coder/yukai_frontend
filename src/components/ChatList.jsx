"use client";

import { useEffect, useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

import {
  requestOnlineUsers,
  onOnlineUsers,
  onUserOnline,
  onUserOffline,
  offPresenceListeners,
} from "@/utilities/socket";

const ChatList = ({ onSelectChat }) => {
  const { getDeviceId, decryptPayload, hasKeys } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();

  const [activeTab, setActiveTab] = useState("all");
  const [chatsList, setChatsList] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [filteredChats, setFilteredChats] = useState([]);

  // ✅ Online users from socket
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  /* ===================== PRESENCE SOCKET ===================== */

  useEffect(() => {
    requestOnlineUsers();

    onOnlineUsers((userIds) => {
      setOnlineUserIds(new Set(userIds.users));
    });

    onUserOnline(({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    });

    onUserOffline(({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      offPresenceListeners();
    };
  }, []);

  /* ===================== FETCH CHATS ===================== */

  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch(`/api/chats?device_id=${getDeviceId()}`);
      setChatsList(res.data ?? []);
    };

    getData();
  }, [apiFetch, getDeviceId]);

  /* ===================== DECRYPT LAST MESSAGE ===================== */

  const getLastMessagePlainText = async ({
    cipher_text,
    iv,
    sender_signed_prekey_pub,
  }) => {
    const plainText = await decryptPayload({
      ciphertext: cipher_text,
      iv,
      sender_signed_prekey_pub,
    });
    return plainText;
  };

  useEffect(() => {
    if (!hasKeys || !chatsList.length) return;

    const decryptAllMessages = async () => {
      const newDecrypted = {};
      for (const chat of chatsList) {
        if (newDecrypted[chat.chat_id]) continue;

        try {
          if (chat.last_message_cipher_text != null) {
            newDecrypted[chat.chat_id] = await getLastMessagePlainText({
              cipher_text: chat.last_message_cipher_text,
              iv: chat.last_message_iv,
              sender_signed_prekey_pub:
                chat.last_message_sender_signed_prekey_pub,
            });
          }
        } catch (err) {
          console.error(err.message);
          newDecrypted[chat.chat_id] = "Encrypted message";
        }
      }
      setDecryptedMessages(newDecrypted);
    };

    decryptAllMessages();
  }, [chatsList, hasKeys]);

  /* ===================== ATTACH ONLINE STATUS ===================== */

  const chatsWithStatus = useMemo(() => {
    return chatsList.map((chat) => {
      const user = chat.participants[0];
      const isOnline = onlineUserIds.has(String(user?.user_id));

      return {
        ...chat,
        online: isOnline,
      };
    });
  }, [chatsList, onlineUserIds]);

  /* ===================== FILTER TABS ===================== */

  useEffect(() => {
    const filtered = chatsWithStatus.filter((chat) => {
      if (activeTab === "unread") return chat.unread_count > 0;
      if (activeTab === "group") return chat.type === "group";
      return true;
    });

    setFilteredChats(filtered);
  }, [activeTab, chatsWithStatus]);

  /* ===================== UI HELPERS ===================== */

  const handleOpenChat = (chat) => {
    const username = chat.participants[0]?.username;
    if (!username) return;

    if (window.innerWidth < 768) {
      router.replace(`/chat/${username}`);
    } else {
      onSelectChat(username);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="main-container-chat">
      <div className="chat-list-container">
        {/* search bar */}
        <div className="chat-list-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 5,
            }}
          >
            <button className="back-button" onClick={() => router.replace("/")}>
              <WestRoundedIcon
                style={{ verticalAlign: "middle", fontSize: 20 }}
              />
            </button>
            <span>Chats</span>
          </div>

          <div className="chat-search-box active">
            <SearchIcon className="icon" />
            <input type="search" placeholder="Search..." />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="chat-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>

        <button
          className={activeTab === "unread" ? "active" : ""}
          onClick={() => setActiveTab("unread")}
        >
          Unread
        </button>

        <button
          className={activeTab === "group" ? "active" : ""}
          onClick={() => setActiveTab("group")}
        >
          Group
        </button>
      </div>

      <div className="chats">
        {filteredChats.map((chat) => {
          const user = chat.participants[0];

          return (
            <div
              className="chat-row"
              key={chat.chat_id}
              onClick={() => handleOpenChat(chat)}
            >
              {/* Avatar */}
              <div className="chat-avatar">
                <Image
                  src={
                    user.profile_image
                      ? `/api/images?url=${user.profile_image}`
                      : `/Images/default-profiles/${user.gender}.jpg`
                  }
                  alt={user.username ?? "account username"}
                  width={48}
                  height={48}
                />

                {/* ✅ ONLINE DOT */}
                {chat.online && <span className="online-dot" />}
              </div>

              {/* Content */}
              <div className="chat-content">
                <div className="chat-top">
                  <span className="chat-name">{user.display_name}</span>

                  <span className="chat-time">
                    {formatTime(chat.last_message_time)}
                  </span>
                </div>

                <div className="chat-bottom">
                  <span className="chat-message">
                    {decryptedMessages[chat.chat_id] ?? "Loading..."}
                  </span>

                  {chat.unread_count > 0 && (
                    <span className="chat-badge">{chat.unread_count}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
