import { FiSearch } from 'react-icons/fi';

interface SearchProperties {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholderText?: string;
}

export function Search({
  searchQuery,
  onSearchChange,
  placeholderText = 'Search tools...',
}: SearchProperties) {
  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <FiSearch
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500"
        size={20}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholderText}
        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}