"use client";

import ChatView from "@/components/ChatView";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Chat = () => {
  const { id } = useParams();
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId;

    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;

        if (!isMobile) {
          if (id === "group") {
            const group_id = params.get("group_id");
            router.replace(`/chat?type=group&group_id=${group_id}`);
          } else router.replace(`/chat?username=${id}`);
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
      <ChatView
        username={id}
        type={id === "group" ? "group" : "private"}
        group_id={params.get("group_id")}
      />
    </div>
  );
};

export default Chat;
