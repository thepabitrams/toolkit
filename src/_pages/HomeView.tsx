import { tools } from '@/config/tools';

export default function HomeView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Privacy-First Tools
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          All processing happens in your browser. No uploads, no servers, just tools.
        </p>
      </div>

      {tools.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <p className="text-gray-500">No tools migrated yet. Phase 1 is complete!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <a
              key={tool.slug}
              href={`/${tool.slug}`}
              className="group block p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {tool.seoDescription}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}