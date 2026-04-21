import { motion } from 'framer-motion';

const tabs = [
  { key: 'recent', label: 'Recent Photos' },
  { key: '1month', label: 'Last Month' },
  { key: '3months', label: 'Last 3 Months' },
];

export default function AdminTabs({ tab, setTab }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
            tab === t.key
              ? 'text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tab === t.key && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
