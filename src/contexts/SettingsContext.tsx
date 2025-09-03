'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AppSettings {
  showPresentations: boolean;
  showContracts: boolean;
  // Add other settings as needed
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  showPresentations: false,
  showContracts: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch multiple settings in parallel
      const [presentationsResponse, contractsResponse] = await Promise.all([
        fetch('/api/settings?key=show_presentations'),
        fetch('/api/settings?key=show_contracts'),
      ]);

      const newSettings: AppSettings = { ...defaultSettings };

      if (presentationsResponse.ok) {
        const presentationsData = await presentationsResponse.json();
        newSettings.showPresentations = presentationsData.value?.enabled || false;
      }

      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        newSettings.showContracts = contractsData.value?.enabled || false;
      }

      setSettings(newSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to fetch application settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchSettings();
    } else if (session === null) {
      // Session is confirmed to be null (not loading)
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [session]);

  const refetch = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refetch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}