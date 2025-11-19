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
      <div className={`
        bg-wp-dark-card/50 mb-6 flex w-fit space-x-1 rounded-lg p-1
      `}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              rounded-md px-6 py-2.5 text-sm font-medium transition-all
              duration-200
              ${activeTab === index 
                ? 'bg-wp-primary text-white shadow-lg' 
                : `
                  text-wp-text-muted
                  hover:text-wp-text-primary hover:bg-wp-dark-card
                `
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="wp-fade-in mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
