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
  onNewMessage,
  offNewMessage,
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
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [activeChatId, setActiveChatId] = useState(null);

  /* ===================== FETCH CHATS ===================== */
  const fetchChats = useCallback(async () => {
    const res = await apiFetch(`/api/chats?device_id=${getDeviceId()}`);
    setChatsList(res.data ?? []);
  }, [apiFetch, getDeviceId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  /* ===================== CHAT CREATE SOCKET ===================== */
  useEffect(() => {
    const handleNewChat = async (newChat) => {
      const chatData = await apiFetch(
        `/api/get-group-chat?chat_id=${
          newChat.chat_id
        }&device_id=${getDeviceId()}`
      );
      setChatsList((prev) => [chatData, ...prev]);
    };
    onChatCreate(handleNewChat);
    return () => offChatCreate(handleNewChat);
  }, [apiFetch, getDeviceId]);

  /* ===================== PRESENCE SOCKET ===================== */
  useEffect(() => {
    requestOnlineUsers();
    onOnlineUsers(({ users }) => setOnlineUserIds(new Set(users)));
    onUserOnline(({ userId }) =>
      setOnlineUserIds((prev) => new Set(prev).add(userId))
    );
    onUserOffline(({ userId }) =>
      setOnlineUserIds((prev) => {
        const copy = new Set(prev);
        copy.delete(userId);
        return copy;
      })
    );
    return () => offPresenceListeners();
  }, []);

  /* ===================== DECRYPT MESSAGE ===================== */
  const decryptMessage = useCallback(
    async ({ chat_id, cipher_text, iv, sender_signed_prekey_pub }) => {
      if (!cipher_text || !hasKeys) {
        setDecryptedMessages((prev) => ({
          ...prev,
          [chat_id]: "Encrypted message",
        }));
        return "Encrypted message";
      }

      try {
        const plain = await decryptPayload({
          ciphertext: cipher_text,
          iv,
          sender_signed_prekey_pub,
        });
        setDecryptedMessages((prev) => ({ ...prev, [chat_id]: plain }));
        return plain;
      } catch (err) {
        console.error("Decrypt failed", err);
        setDecryptedMessages((prev) => ({
          ...prev,
          [chat_id]: "Encrypted message",
        }));
        return "Encrypted message";
      }
    },
    [decryptPayload, hasKeys]
  );

  /* ===================== INITIAL DECRYPT ALL ===================== */
  useEffect(() => {
    if (!hasKeys || !chatsList.length) return;

    chatsList.forEach((chat) => {
      if (chat.last_message_cipher_text) {
        decryptMessage({
          chat_id: chat.chat_id,
          cipher_text: chat.last_message_cipher_text,
          iv: chat.last_message_iv,
          sender_signed_prekey_pub: chat.last_message_sender_signed_prekey_pub,
        });
      }
    });
  }, [chatsList, decryptMessage]);

  /* ===================== NEW MESSAGE SOCKET ===================== */
  useEffect(() => {
    const handleNewMessage = async (message) => {
      const { chat_id, cipher_text, iv, sender_signed_prekey_pub } = message;
      const preview = await decryptMessage({
        cipher_text,
        iv,
        sender_signed_prekey_pub,
      });

      console.log({ [chat_id]: preview }); // real time message data is updating on group chat (only for receiving message) unread count is working too

      setDecryptedMessages((prev) => ({ ...prev, [chat_id]: preview }));

      setChatsList((prev) => {
        const index = prev.findIndex((c) => c.chat_id === chat_id);
        if (index === -1) return prev;
        const chat = prev[index];

        const updatedChat = {
          ...chat,
          last_message_time: new Date().toISOString(),
          unread_count:
            chat_id === activeChatId ? 0 : (chat.unread_count ?? 0) + 1,
        };

        const newList = [...prev];
        newList.splice(index, 1);
        return [updatedChat, ...newList];
      });
    };

    onNewMessage(handleNewMessage);
    return () => offNewMessage(handleNewMessage);
  }, [decryptMessage, activeChatId]);

  /* ===================== ONLINE STATUS ===================== */
  const chatsWithStatus = useMemo(
    () =>
      chatsList.map((chat) => {
        const user = chat.participants[0];
        return { ...chat, online: onlineUserIds.has(String(user?.user_id)) };
      }),
    [chatsList, onlineUserIds]
  );

  /* ===================== FILTER TABS ===================== */
  const filteredChats = useMemo(() => {
    return chatsWithStatus.filter((chat) => {
      if (activeTab === "unread") return chat.unread_count > 0;
      if (activeTab === "group") return chat.type === "group";
      return true;
    });
  }, [chatsWithStatus, activeTab]);

  /* ===================== OPEN CHAT ===================== */
  const handleOpenChat = (chat) => {
    const username = chat.participants[0]?.username;
    if (!username) return;

    setActiveChatId(chat.chat_id);
    setChatsList((prev) =>
      prev.map((c) =>
        c.chat_id === chat.chat_id ? { ...c, unread_count: 0 } : c
      )
    );

    const route =
      chat.type === "group"
        ? `/chat/group?group_id=${chat.chat_id}`
        : `/chat/${username}`;
    if (window.innerWidth < 768) router.replace(route);
    else onSelectChat(username, chat.type, chat.chat_id);
  };

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

  return (
    <div className="main-container-chat">
      <div className="chat-list-container">
        <div className="chat-list-header">
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
              onClick={() => setIsModalOpen(true)}
            >
              <AddCircleOutlinedIcon />
            </button>
          </div>
        </div>
      </div>

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
                {chat.online && <span className="online-dot" />}
              </div>
              <div className="chat-content">
                <div className="chat-top">
                  <span className="chat-name">
                    {chat.type === "group" ? chat.chat_name : user.display_name}
                  </span>
                  <span className="chat-time">
                    {formatTime(chat.last_message_time, { utc: true })}
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
        onClose={() => setIsModalOpen(false)}
        onCreated={async (newChat) => {
          const chatData = await fetchChats();
        }}
      />
    </div>
  );
};

export default ChatList;

/* ===================== CREATE CHAT MODAL ===================== */
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
    const payload = { chat_name: groupName, members: [...selected] };
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
          onChange={(e) => setGroupName(e.target.value)}
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
