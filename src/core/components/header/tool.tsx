import { useState, useRef, useEffect } from 'react';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';
import { FiMenu, FiX } from 'react-icons/fi';
import { Motion } from '@/core/motion/motion';
import { drawerMotion } from '@/core/motion/compositions/drawerMotion';
import { tools } from '@/config/tools';
import { site } from '@/config/site';
import ThemeToggle from '@/core/components/ui/ThemeToggle';

export default function ToolHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isDrawerOpen) return;
      const eventTarget = event.target as Node;
      const isDrawer = drawerRef.current?.contains(eventTarget);
      const isToggle = toggleRef.current?.contains(eventTarget);
      if (!isDrawer && !isToggle) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen((previousState) => !previousState);

  return (
    <header className="sticky top-0 z-50 h-16 bg-gray-50 dark:bg-gray-950 flex items-center">
      <Container className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div ref={toggleRef}>
            <IconButton
              onClick={toggleDrawer}
              variant="standard"
              size="md"
              ariaLabel="Toggle menu"
              className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
            >
              {isDrawerOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </IconButton>
          </div>

          <a 
            href="/" 
            className="font-medium text-lg tracking-tight text-gray-800 dark:text-gray-100 hover:opacity-80 transition-opacity"
          >
            {site.name}
          </a>
        </div>

        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </Container>

      <Motion
        preset={drawerMotion}
        as="div"
        ref={drawerRef}
        className={`
          fixed top-16 left-0 w-80 max-w-[80vw] h-[calc(100vh-4rem)] z-40
          bg-gray-50 dark:bg-gray-950 shadow-xl border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]
          ${isDrawerOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible pointer-events-none'}
        `}
      >
        <div className="p-4 overflow-y-auto h-full">
          <nav className="flex flex-col gap-1">
            {tools.map((registeredTool) => (
              <a
                key={registeredTool.slug}
                href={`/${registeredTool.slug}`}
                onClick={() => setIsDrawerOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
              >
                {registeredTool.displayName}
              </a>
            ))}
          </nav>
        </div>
      </Motion>
    </header>
  );
}