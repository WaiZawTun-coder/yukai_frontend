"use client";

import ChatList from "@/components/ChatList";
import ChatView from "@/components/ChatView";
import { useRouter, useSearchParams } from "next/navigation";
// import ChatView from "@/components/ChatView";
import { useState } from "react";

export default function ChatPage() {
  const params = useSearchParams();
  const router = useRouter();
  const username = params.get("username");
  const [activeChat, setActiveChat] = useState(username ?? "");
  const [activeChatType, setActiveChatType] = useState("private");
  const [activeGroupId, setActiveGroupId] = useState(0);

  const changeChat = (username, chatType, groupId) => {
    console.log({ username, chatType, groupId });
    setActiveChat(username);
    setActiveChatType(chatType);
    setActiveGroupId(groupId);
    if (chatType === "group") router.push(`?type=group&chat_id=${groupId}`);
    else router.push(`?username=${username}`);
  };

  return (
    <div className="chat-layout">
      <div className="chat-list-pane">
        <ChatList onSelectChat={changeChat} />
      </div>

      <div className="chat-view-pane">
        {activeChat ? (
          <ChatView
            username={username}
            type={activeChatType}
            group_id={activeGroupId}
          />
        ) : (
          <div className="empty-chat">Select a chat</div>
        )}
      </div>
    </div>
  );
}
