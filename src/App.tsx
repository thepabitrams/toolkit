import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HomePage } from '@/_pages/old/HomePage';
import { ToolPage } from '@/_pages/old/ToolPage';
import { useThemeStore } from '@/core/store/themeStore';
import { useFileStore } from '@/core/store/fileStore';
import { ToastContainer } from '@/core/components/ui/toast';
import { useToast } from '@/core/hooks/useToast';

function RouteChangeListener({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { clearAll } = useToast();

  useEffect(() => {
    clearAll();
  }, [location.pathname, clearAll]);

  return <>{children}</>;
}

function App() {
  const { theme, setSystemTheme } = useThemeStore();
  const init = useFileStore((state) => state.init);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      setSystemTheme();
    } else {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark', isDark);
    }
  }, [theme, setSystemTheme]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <RouteChangeListener>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:toolId" element={<ToolPage />} />
        </Routes>
        <ToastContainer />
      </RouteChangeListener>
    </BrowserRouter>
  );
}

export default App;