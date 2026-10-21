import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeToggle = () => {
    const htmlElement = document.documentElement;
    const nextThemeState = !isDarkMode;
    htmlElement.classList.toggle('dark', nextThemeState);
    localStorage.setItem('theme', nextThemeState ? 'dark' : 'light');
    setIsDarkMode(nextThemeState);
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
    </button>
  );
}