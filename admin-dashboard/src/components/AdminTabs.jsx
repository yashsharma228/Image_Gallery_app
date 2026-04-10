const tabs = [
  { key: 'recent', label: 'Recent' },
  { key: '1month', label: '1 month ago' },
  { key: '3months', label: '3 months ago' },
];

export default function AdminTabs({ tab, setTab }) {
  return (
    <div className="flex gap-6 mb-8">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`pb-1 font-semibold ${
            tab === t.key
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-green-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
