"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

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
  onChatCreate,
  offChatCreate,
} from "@/utilities/socket";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

const ChatList = ({ onSelectChat }) => {
  const { getDeviceId, decryptPayload, hasKeys } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [chatsList, setChatsList] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [filteredChats, setFilteredChats] = useState([]);

  // ✅ Online users from socket
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  const getChat = useCallback(
    async (chat_id) => {
      const res = await apiFetch(
        `/api/get-group-chat?chat_id=${chat_id}&device_id=${getDeviceId()}`
      );

      return res.data;
    },
    [apiFetch, getDeviceId]
  );

  /* ===================== CHAT CREATE SOCKET ===================== */
  useEffect(() => {
    const updateChat = async (new_chat) => {
      const chat = await getChat(new_chat.chat_id);
      setChatsList((prev) => [chat, ...prev]);
    };
    onChatCreate(updateChat);

    return () => offChatCreate(updateChat);
  }, [getChat]);

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

    const route =
      chat.type === "group"
        ? `/chat/group?group_id=${chat.chat_id}`
        : `/chat/${username}`;

    if (window.innerWidth < 768) {
      router.replace(route);
    } else {
      onSelectChat(username, chat.type, chat.chat_id);
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

          <div className="chat-action-box">
            <div className="chat-search-box active">
              <SearchIcon className="icon" />
              <input type="search" placeholder="Search..." />
            </div>
            <button
              className="action-icon"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <AddCircleOutlinedIcon />
            </button>
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
          const isGroup = chat.type === "group";

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
                  <span className="chat-name">
                    {isGroup ? chat.chat_name : user.display_name}
                  </span>

                  <span className="chat-time">
                    {formatTime(chat.last_message_time)}
                  </span>
                </div>

                <div className="chat-bottom">
                  <span className="chat-message">
                    {decryptedMessages[chat.chat_id] ?? ""}
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
      <CreateChatModal
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onCreated={async (newChat) => {
          const chat_id = newChat.chat_id;
          const chat_data = await getChat(chat_id);
          setChatsList((prev) => [chat_data, ...prev]);
        }}
      />
    </div>
  );
};

export default ChatList;

const CreateChatModal = ({ isModalOpen, onClose, onCreated }) => {
  const apiFetch = useApi();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [groupName, setGroupName] = useState("");

  const isGroup = selected.size >= 2;

  useEffect(() => {
    const update = async () => {
      const res = await apiFetch("/api/get-friends");
      const totalPages = res.total_pages;
      let curPage = res.page + 1;
      let friendsList = res.data;
      while (curPage < totalPages) {
        const res = await apiFetch(`/api/get-friends?page=${curPage}`);
        friendsList = [...friendsList, ...res.data];
      }

      setUsers(friendsList);
    };

    update();
  }, [apiFetch]);

  const toggleUser = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (isGroup && !groupName.trim()) return;

    const payload = {
      chat_name: groupName,
      members: [...selected],
    };

    const res = await apiFetch("/api/chats/group", {
      method: "POST",
      body: payload,
    });

    onCreated(res.data);
    onClose();
  };

  return (
    <Modal isOpen={isModalOpen} onClose={onClose} title={"Create New Group"}>
      {isGroup && (
        <input
          placeholder="Group name"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
      )}

      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.user_id}
            className={`user-row ${
              selected.has(user.user_id) ? "selected" : ""
            }`}
            onClick={() => toggleUser(user.user_id)}
          >
            <Image
              src={
                user.profile_image
                  ? `/api/images?url=${user.profile_image}`
                  : `/Images/default-profiles/${user.gender}.jpg`
              }
              width={40}
              height={40}
              alt={user.username}
            />

            <span>{user.display_name}</span>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} disabled={!selected.size}>
          Create
        </Button>
      </div>
    </Modal>
  );
};
