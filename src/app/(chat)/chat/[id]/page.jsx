"use client";

import ChatView from "@/components/ChatView";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const Chat = () => {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    console.log({ id });
    if (typeof window === "undefined") return;

    let timeoutId;

    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;

        if (!isMobile) {
          router.replace(`/chat?username=${id}`);
        }
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, [id, router]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      router.replace(`/chat?username=${id}`);
    }
  }, [router, id]);

  return (
    <div className="mobile-chat-page">
      <ChatView username={id} />
    </div>
  );
};

export default Chat;
