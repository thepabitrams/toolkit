import { useState, useRef, useEffect } from 'react';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';
import { FiMenu, FiX } from 'react-icons/fi';
import { tools } from '@/config/tools';
import { site } from '@/config/site';
import ThemeToggle from '@/core/components/ui/ThemeToggle';

export default function ToolHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (mouseEvent: MouseEvent) => {
      if (!isDrawerOpen) return;
      const eventTarget = mouseEvent.target as Node;
      const isTargetInsideDrawer = drawerRef.current?.contains(eventTarget);
      const isTargetInsideToggle = menuToggleRef.current?.contains(eventTarget);
      if (!isTargetInsideDrawer && !isTargetInsideToggle) setIsDrawerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen((previousDrawerState) => !previousDrawerState);

  return (
    <header className="sticky top-0 z-50 h-16 bg-gray-50 dark:bg-gray-950 flex items-center">
      <Container className="w-full flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div ref={menuToggleRef} className="w-9 h-9 shrink-0 flex items-center justify-center">
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

      <div
        ref={drawerRef}
        className={`absolute top-full left-0 w-full bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out transform ${
          isDrawerOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        <div className="p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
      </div>
    </header>
  );
}