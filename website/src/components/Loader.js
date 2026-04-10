'use client';

import React from 'react';

const Loader = () => {
  // Skeleton loader for gallery cards
  return (
    <div className="flex flex-wrap gap-6 justify-center items-start min-h-screen py-16 bg-slate-950">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton w-72 h-96 mb-4" />
      ))}
    </div>
  );
};

export default Loader;
