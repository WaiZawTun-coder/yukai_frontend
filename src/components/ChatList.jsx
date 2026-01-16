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
  const { getDeviceId } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();

  const [activeTab, setActiveTab] = useState("all");
  const [chatsList, setChatsList] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch(`/api/chats?device_id=${getDeviceId()}`);

      setChatsList(res.data ?? []);
    };

    getData();
  }, [apiFetch, getDeviceId]);

  const handleOpenChat = (chat) => {
    if (window.innerWidth < 768) {
      // redirect to recipient username
      router.replace(`/chat/${chat.chat_id}`);
    } else {
      onSelectChat(chat.chat_id);
    }
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
        {chatsList.map((chat) => (
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
                <span className="chat-time">{chat.last_message_time}</span>
              </div>

              <div className="chat-bottom">
                <span className="chat-message">{chat.last_message}</span>

                {chat.unread > 0 && (
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
