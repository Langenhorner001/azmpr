import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

const STORAGE_KEY = "az-theme"; // 'auto' | 'light' | 'dark'
const ORDER = ["auto", "light", "dark"];

const getSystemPref = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolveDark = (mode) => (mode === "auto" ? getSystemPref() : mode === "dark");

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return ORDER.includes(saved) ? saved : "auto";
  });
  const [isDark, setIsDark] = useState(() => resolveDark(localStorage.getItem(STORAGE_KEY) || "auto"));

  useEffect(() => {
    const root = document.documentElement;
    const dark = resolveDark(mode);
    setIsDark(dark);
    root.classList.toggle("dark", dark);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Watch system pref changes when in auto mode
  useEffect(() => {
    if (mode !== "auto" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const dark = mq.matches;
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  // Cycle: auto → light → dark → auto
  const toggleTheme = useCallback(() => {
    setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
