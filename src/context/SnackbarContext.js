"use client";

import { createContext, useContext, useState } from "react";
import Snackbar from "@/components/snackbar/Snackbar";

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [snacks, setSnacks] = useState([]);

  const showSnackbar = ({
    title = "",
    message,
    variant = "info",
    duration = 3000,
  }) => {
    const id = crypto.randomUUID();

    setSnacks((prev) => [...prev, { id, title, message, variant, duration }]);
  };

  const removeSnackbar = (id) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar snacks={snacks} onRemove={removeSnackbar} />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside SnackbarProvider");
  return ctx;
};
