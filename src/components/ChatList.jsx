"use client";

import { useEffect, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const CHATS = [
  {
    id: 1,
    name: "Thant Sithu Thein",
    avatar: "/Images/Eunsoo.jpg",
    lastMessage: "Are you free tonight?",
    time: "10:24",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Frontend Team",
    avatar: "/Images/group.png",
    lastMessage: "Deploy is done 🚀",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Aung Aung",
    avatar: "/Images/user.png",
    lastMessage: "Thanks bro!",
    time: "09:12",
    unread: 1,
    online: true,
  },
];

const ChatList = ({ onSelectChat }) => {
  const { getDeviceId, decryptPayload, hasKeys } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();

  const [activeTab, setActiveTab] = useState("all");
  const [chatsList, setChatsList] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch(`/api/chats?device_id=${getDeviceId()}`);

      setChatsList(res.data ?? []);
    };

    getData();
  }, [apiFetch, getDeviceId]);

  const getLastMessagePlainText = async ({
    cipher_text,
    iv,
    sender_signed_prekey_pub,
  }) => {
    const plainText = await decryptPayload({
      ciphertext: cipher_text,
      iv: iv,
      sender_signed_prekey_pub: sender_signed_prekey_pub,
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

  useEffect(() => {
    const updateFilteredChat = () => {
      const filterd = chatsList.filter((chat) => {
        if (activeTab === "unread") return chat.unread_count > 0;
        if (activeTab === "group") return chat.type === "group";
        return true;
      });

      setFilteredChats(filterd);
    };

    updateFilteredChat();
  }, [activeTab, chatsList]);

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
          <div
            className={`chat-search-box active`}
            // onClick={() => {
            //   setSearchActive(true);
            // }}
          >
            <SearchIcon className="icon" />
            <input
              // ref={inputRef}
              type="search"
              placeholder="Search..."
              // value={searchText}
              // onFocus={() => setSearchActive(true)}
              // onBlur={() => {
              //   if (searchText == "") setSearchActive(false);
              // }}
              // onChange={(e) => setSearchText(e.target.value)}
            />
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
        {filteredChats.map((chat, i) => (
          <div
            className="chat-row"
            key={chat.chat_id}
            onClick={() => handleOpenChat(chat)}
          >
            {/* Avatar */}
            <div className="chat-avatar">
              <Image
                src={
                  chat.participants[0].profile_image
                    ? `/api/images?url=${chat.participants[0].profile_image}`
                    : `/Images/default-profiles/${chat.participants[0].gender}.jpg`
                }
                alt={chat.participants[0].username ?? "account username"}
                width={48}
                height={48}
              />
              {chat.online && <span className="online-dot" />}
            </div>

            {/* Content */}
            <div className="chat-content">
              <div className="chat-top">
                {/* {JSON.stringify(chat)} */}
                {/* {JSON.stringify(chat.type)} */}
                <span className="chat-name">
                  {chat.participants[0].display_name}
                </span>
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
        ))}
      </div>
    </div>
  );
};
export default ChatList;
