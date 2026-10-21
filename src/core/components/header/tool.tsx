// src/core/components/header/tool/index.tsx
import { useState, useRef, useEffect } from 'react';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';
import { FiMenu, FiX } from 'react-icons/fi';
import { Motion } from '@/core/motion/motion';
import { drawerMotion } from '@/core/motion/compositions/drawerMotion';
import { tools } from '@/config/tools';
// ✅ Import your pure DOM ThemeToggle component
import ThemeToggle from '@/core/components/ui/ThemeToggle'; 

interface ToolHeaderProps {
  toolName?: string;
}

export default function ToolHeader({ toolName = '' }: ToolHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!drawerOpen) return;
      const target = e.target as Node;
      const isDrawer = drawerRef.current?.contains(target);
      const isToggle = toggleRef.current?.contains(target);
      if (!isDrawer && !isToggle) setDrawerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const title = toolName ? `${toolName} by PabitraMS` : 'ToolPabitraMS';

  return (
    <header className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-950">
      <Container className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div ref={toggleRef}>
            <IconButton
              onClick={toggleDrawer}
              variant="standard"
              size="md"
              ariaLabel="Toggle menu"
              className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
            >
              {drawerOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </IconButton>
          </div>
        </div>

        <a
          href="/"
          className="font-medium text-lg tracking-tight text-gray-800 dark:text-gray-100 hover:opacity-80 transition-opacity"
        >
          {title}
        </a>

        {/* ✅ Replaced the old IconButton and Zustand logic with your component */}
        <ThemeToggle />
        
      </Container>

      <Motion
        preset={drawerMotion}
        as="div"
        ref={drawerRef}
        className={`
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]
          ${drawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}
      >
        <div className="p-4">
          <nav className="flex flex-col gap-1">
            {tools.map((tool) => (
              <a
                key={tool.slug}
                href={`/${tool.slug}`}
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
              >
                <span className="mr-2">{tool.icon ?? '•'}</span>
                {tool.name}
              </a>
            ))}
          </nav>
        </div>
      </Motion>
    </header>
  );
}