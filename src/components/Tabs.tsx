'use client';

import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveTab?: number;
}

export default function Tabs({ tabs, defaultActiveTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <div className="w-full">
      <div className="flex space-x-1 bg-wp-dark-card/50 p-1 rounded-lg mb-6 w-fit">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200
              ${activeTab === index 
                ? 'bg-wp-primary text-white shadow-lg' 
                : 'text-wp-text-muted hover:text-wp-text-primary hover:bg-wp-dark-card'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 wp-fade-in">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
