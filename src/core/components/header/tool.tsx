import { useState, useRef, useEffect } from 'react';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';
import { FiMenu, FiX } from 'react-icons/fi';
import { Motion } from '@/core/motion/motion';
import { drawerMotion } from '@/core/motion/compositions/drawerMotion';
import { site } from '@/config/site';
import ThemeToggle from '@/core/components/ui/ThemeToggle';
import { ToolHub } from '@/core/components/tool-hub/ToolHub';

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
      if (!isTargetInsideDrawer && !isTargetInsideToggle) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen((previousDrawerState) => !previousDrawerState);

  return (
    <header className="sticky top-0 z-50 h-16 bg-gray-50 dark:bg-gray-950 flex items-center">
      <Container className="w-full flex items-center justify-between">
        
        <div className="flex items-center gap-3 w-full">
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

      <Motion
        preset={drawerMotion}
        as="div"
        ref={drawerRef}
        className={`
          fixed top-16 left-0 w-80 max-w-[80vw] h-[calc(100vh-4rem)] z-40
          bg-gray-50 dark:bg-gray-950 shadow-xl border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-in-out overflow-hidden
          ${isDrawerOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible pointer-events-none'}
        `}
      >
        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          <ToolHub displayVariant="list" />
        </div>
      </Motion>
    </header>
  );
}