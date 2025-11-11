import { createContext, useState, useEffect, useContext } from 'react';

// Create a new context for theme management
const ThemeContext = createContext();

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || THEMES.LIGHT;
  });

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Apply theme class to the document body when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLightTheme: theme === THEMES.LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
