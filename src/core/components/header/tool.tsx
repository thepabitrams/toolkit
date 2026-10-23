import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';
import { LinkButton } from '@/core/components/ui/LinkButton'; 
import { FiMenu, FiX } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa'; // <--- Solid filled heart
import { site, sponsor } from '@/config/site';
import { ThemeToggle } from '@/core/components/ui/ThemeToggle';
import { ToolHub } from '@/core/components/tool-hub';
import { drawerVariants } from '@/config/motion'; 

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
    <header className="sticky top-0 z-50 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 flex items-center">
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
            className="font-semibold text-lg tracking-tight text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
          >
            {site.name}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          <LinkButton
            variant="monochrome"
            href={sponsor.page} 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full"
          >
            {/* Solid heart inheriting the button's text color */}
            <FaHeart className="w-3.5 h-3.5" />
            <span>Sponsor</span>
          </LinkButton>

          <ThemeToggle />
        </div>
        
      </Container>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed top-16 left-0 w-80 max-w-[80vw] h-[calc(100vh-4rem)] z-40
              bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-xl border-r border-gray-200 dark:border-gray-800
              overflow-hidden
            "
          >
            <div className="h-full w-full overflow-y-auto overflow-x-hidden">
              <ToolHub displayVariant="list" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}