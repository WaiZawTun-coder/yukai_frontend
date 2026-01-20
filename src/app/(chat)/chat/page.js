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

  const changeChat = (username) => {
    console.log(username);
    setActiveChat(username);
    router.push(`?username=${username}`);
  };

  return (
    <div className="chat-layout">
      <div className="chat-list-pane">
        <ChatList onSelectChat={changeChat} />
      </div>

      <div className="chat-view-pane">
        {activeChat ? (
          <ChatView username={username} />
        ) : (
          <div className="empty-chat">Select a chat</div>
        )}
      </div>
    </div>
  );
}
