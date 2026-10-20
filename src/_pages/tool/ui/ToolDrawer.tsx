import { tools } from '@/config/tools';
import { useToolStore } from '@/shared/store/toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function ToolDrawer({ currentSlug }: { currentSlug: string }) {
  const { favorites, toggleFavorite } = useToolStore();

  const handleClose = () => {
    const drawer = document.getElementById('tool-drawer');
    const overlay = document.getElementById('tool-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  };

  return (
    <>
      <div 
        id="tool-drawer-overlay" 
        onClick={handleClose}
        className="hidden fixed inset-0 bg-black/50 z-100 backdrop-blur-sm transition-opacity"
      />
      
      <div 
        id="tool-drawer"
        className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-950 z-110 shadow-2xl border-r border-gray-200 dark:border-gray-800 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-lg dark:text-white">All Tools</h2>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {tools.map((tool) => {
            const isActive = tool.slug === currentSlug;
            const isFav = favorites.includes(tool.slug);

            return (
              <a
                key={tool.slug}
                href={`/${tool.slug}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="truncate pr-4">{tool.name}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(tool.slug);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  {isFav ? <FaHeart className="text-red-500 w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                </button>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}