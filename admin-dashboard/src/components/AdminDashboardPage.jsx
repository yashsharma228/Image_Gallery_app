import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import AdminGalleryGrid from './AdminGalleryGrid';

export default function AdminDashboardPage({ images, user }) {
  const [tab, setTab] = useState('recent');
  const [search, setSearch] = useState('');

  // Filter images by tab and search
  const filteredImages = images.filter(img => {
    // Add your tab and search logic here
    return img.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AdminHeader user={user} search={search} setSearch={setSearch} />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-1">
            Framely <span className="mx-1">{'>'}</span> <span className="text-green-600">Photos</span>
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500">Photos</h1>
        </div>
        <AdminTabs tab={tab} setTab={setTab} />
        <AdminGalleryGrid images={filteredImages} />
      </div>
    </div>
  );
}
