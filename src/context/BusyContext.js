"use client";

import { createContext, useContext, useState } from "react";

const BusyContext = createContext(null);

export function BusyProvider({ children }) {
  const [busyMap, setBusyMap] = useState({}); // { userId: boolean }

  const updateBusy = (userId, busy) => {
    setBusyMap((prev) => ({
      ...prev,
      [String(userId)]: busy,
    }));
  };

  const isUserBusy = (userId) => {
    return !!busyMap[String(userId)];
  };

  return (
    <BusyContext.Provider value={{ updateBusy, isUserBusy }}>
      {children}
    </BusyContext.Provider>
  );
}

export const useBusy = () => useContext(BusyContext);
