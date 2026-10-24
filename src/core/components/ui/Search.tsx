import { FiSearch } from 'react-icons/fi';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  offset?: string;
}

export function Search({
  value,
  onChange,
  placeholder = 'Search tools...',
  offset = 'top-[60px]'
}: SearchProps) {
  return (
    <div className={`sticky ${offset} z-40 py-4`}>
      <div className="flex justify-center">
        <div className="relative w-full max-w-md group">
          <div
            className={`
              relative w-full
              rounded-full
              overflow-hidden
              bg-white dark:bg-[#171b22]
              border border-gray-200 dark:border-[rgba(255,255,255,0.08)]
              hover:border-gray-300 dark:hover:border-[rgba(255,255,255,0.14)]
              focus-within:border-blue-500
              focus-within:ring-2 focus-within:ring-blue-500/20
              transition-all duration-300 ease-out
              
              shadow-md
              hover:shadow-lg
              focus-within:shadow-xl
              
              dark:shadow-[0_0_15px_rgba(186,230,253,0.10)]
              dark:hover:shadow-[0_0_25px_rgba(186,230,253,0.20)]
              dark:focus-within:shadow-[0_0_30px_rgba(186,230,253,0.25)]
            `}
          >
            <FiSearch
              className={`
                absolute left-4 top-1/2 -translate-y-1/2
                w-5 h-5
                text-gray-500 dark:text-gray-400
                transition-colors duration-200
                group-hover:text-blue-500 dark:group-hover:text-blue-400
                group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400
                pointer-events-none
                z-10
              `}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`
                w-full pl-11 pr-4 py-3
                bg-transparent
                text-sm
                text-gray-900 dark:text-white
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                outline-none
                border-none
                focus:ring-0
              `}
            />
          </div>
        </div>
      </div>
    </div>
  );
}