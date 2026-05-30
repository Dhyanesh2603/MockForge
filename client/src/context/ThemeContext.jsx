import { createContext, useContext, useEffect, useState } from "react";

export const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("mockforge-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.body.classList.toggle("light", !dark);
    localStorage.setItem("mockforge-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, setDark }}>
      {children}
    </ThemeCtx.Provider>
  );
}
