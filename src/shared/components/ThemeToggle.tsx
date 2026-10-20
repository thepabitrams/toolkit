import { useState, useEffect } from 'react';

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
      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle visual theme"
    >
      {isDarkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}