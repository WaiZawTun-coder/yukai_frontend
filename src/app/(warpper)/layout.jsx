"use client";

import FloatingCall from "@/components/FloatingCall";
import { MessageNotifications } from "@/components/MessageNotification";
import { BusyProvider } from "@/context/BusyContext";
import { CallProvider } from "@/context/CallContext";
import { NotificationProvider } from "@/context/NotificationContext";
import SocketInitializer from "@/utilities/SocketInitializer";

export default function wrapperLayout({ children }) {
  return (
    <>
      <NotificationProvider>
        <BusyProvider>
          <CallProvider>
            <SocketInitializer />
            {children}
            <FloatingCall />
            <MessageNotifications />
          </CallProvider>
        </BusyProvider>
      </NotificationProvider>
    </>
  );
}
