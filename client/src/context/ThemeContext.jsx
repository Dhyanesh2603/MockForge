import { createContext, useContext, useState } from "react";

export const ThemeCtx = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

// Run synchronously before any render to prevent flicker
function initTheme() {
  const saved = localStorage.getItem("mf-theme");
  const dark = saved ? saved === "dark" : true; // DEFAULT = DARK
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  return dark;
}
const _initial = initTheme();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(_initial);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("mf-theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
