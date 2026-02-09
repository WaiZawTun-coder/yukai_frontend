"use client";
import { useEffect, useState } from "react";
import ThemeToggleSwitch from "./ui/theme-toggler";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return <ThemeToggleSwitch checked={theme == "dark"} onChange={toggleTheme} />;
}
