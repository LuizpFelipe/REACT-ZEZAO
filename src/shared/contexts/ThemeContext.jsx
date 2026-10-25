import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

const CHAVE_STORAGE = "zezao:theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(CHAVE_STORAGE) || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(CHAVE_STORAGE, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((atual) => (atual === "light" ? "dark" : "light"));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
