"use client";

import ChatList from "@/components/ChatList";
import ChatView from "@/components/ChatView";
import { useRouter, useSearchParams } from "next/navigation";
// import ChatView from "@/components/ChatView";
import { useState } from "react";

export default function ChatPage() {
  const params = useSearchParams();
  const router = useRouter();
  const chat_id = params.get("chat_id");
  const [activeChat, setActiveChat] = useState(chat_id ?? 0);

  const changeChat = (chat_id) => {
    setActiveChat(chat_id);
    router.push(`?chat_id=${chat_id}`);
  };

  return (
    <div className="chat-layout">
      <div className="chat-list-pane">
        <ChatList onSelectChat={changeChat} />
      </div>

      <div className="chat-view-pane">
        {activeChat ? (
          <ChatView id={activeChat} />
        ) : (
          <div className="empty-chat">Select a chat</div>
        )}
      </div>
    </div>
  );
}
