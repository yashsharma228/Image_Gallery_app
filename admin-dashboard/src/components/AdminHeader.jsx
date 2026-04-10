export default function AdminHeader({ user, search, setSearch }) {
  return (
    <div className="flex justify-end items-center mb-8 gap-4">
      <div className="relative w-72">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search photos"
          className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-200 w-full"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="18" height="18" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/><path d="M17 17L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
      </div>
      <button className="flex items-center gap-2">
        <img src={user.avatar} alt="profile" className="w-9 h-9 rounded-full border" />
        <span className="font-semibold text-gray-700">{user.name}</span>
        <svg width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}
