import { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const colorScheme = Appearance.getColorScheme(); // "light" or "dark"
  const [theme, setTheme] = useState(colorScheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Optional: Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
