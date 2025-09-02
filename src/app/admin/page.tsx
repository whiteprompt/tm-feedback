'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminPage() {
  const [showContracts, setShowContracts] = useState(false);
  const [showPresentations, setShowPresentations] = useState(false);
  const [enableCacheCleanup, setEnableCacheCleanup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState('');
  const [cacheCleanupStatus, setCacheCleanupStatus] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchSettings();
    } else if (status === 'authenticated') {
      router.push('/');
    }
    setIsLoading(false);
  }, [session, status, router, isAdmin]);

  const fetchSettings = async () => {
    try {
      const [contractsResponse, presentationsResponse, cacheCleanupResponse] = await Promise.all([
        fetch('/api/settings?key=show_contracts'),
        fetch('/api/settings?key=show_presentations'),
        fetch('/api/settings?key=enable_cache_cleanup')
      ]);

      if (contractsResponse.ok) {
        const data = await contractsResponse.json();
        setShowContracts(data.value.enabled);
      }

      if (presentationsResponse.ok) {
        const data = await presentationsResponse.json();
        setShowPresentations(data.value.enabled);
      }

      if (cacheCleanupResponse.ok) {
        const data = await cacheCleanupResponse.json();
        setEnableCacheCleanup(data.value.enabled);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleContracts = async () => {
    const newValue = !showContracts;
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: 'show_contracts',
          enabled: newValue 
        }),
      });

      if (response.ok) {
        setShowContracts(newValue);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const togglePresentations = async () => {
    const newValue = !showPresentations;
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: 'show_presentations',
          enabled: newValue 
        }),
      });

      if (response.ok) {
        setShowPresentations(newValue);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const toggleCacheCleanup = async () => {
    const newValue = !enableCacheCleanup;
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: 'enable_cache_cleanup',
          enabled: newValue 
        }),
      });

      if (response.ok) {
        setEnableCacheCleanup(newValue);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const triggerCron = async () => {
    setCronStatus('Running...');
    try {
      const response = await fetch('/api/cron/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setCronStatus('Cron job triggered successfully!');
      } else {
        const data = await response.json();
        setCronStatus(data.error || 'Failed to trigger cron job');
      }
    } catch (error) {
      console.error('Error triggering cron job:', error);
      setCronStatus('Error triggering cron job');
    }
  };

  const triggerCacheCleanup = async () => {
    setCacheCleanupStatus('Running...');
    try {
      const response = await fetch('/api/cron/cache-cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCacheCleanupStatus(data.message || 'Cache cleanup completed successfully!');
      } else {
        const data = await response.json();
        setCacheCleanupStatus(data.error || 'Failed to trigger cache cleanup');
      }
    } catch (error) {
      console.error('Error triggering cache cleanup:', error);
      setCacheCleanupStatus('Error triggering cache cleanup');
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen wp-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
            </div>
            <p className="wp-body text-wp-text-secondary">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="wp-section-sm">
        <div className="wp-container">
          {/* Header Section */}
          <div className="text-center mb-16 wp-fade-in">
            <h1 className="wp-heading-1 mb-4">Admin Dashboard</h1>
            <p className="wp-body-large max-w-2xl mx-auto">
              Manage system settings, feature toggles, and maintenance operations.
            </p>
            <br />
          </div>

          <div className="space-y-8 wp-slide-up">
            {/* Feature Toggles Card */}
            <div className="wp-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-wp-primary to-wp-accent rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="wp-heading-3">Feature Toggles</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-wp-dark-card/30 rounded-lg border border-wp-border/50">
                  <div className="flex-1">
                    <h3 className="wp-body font-semibold text-wp-text-primary mb-1">Show &ldquo;My Contracts&rdquo; Section</h3>
                    <p className="wp-body-small text-wp-text-secondary">Enable or disable the contracts section for all users</p>
                  </div>
                  <button
                    onClick={toggleContracts}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50 ${
                      showContracts ? 'bg-gradient-to-r from-wp-primary to-wp-accent' : 'bg-wp-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        showContracts ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-wp-dark-card/30 rounded-lg border border-wp-border/50">
                  <div className="flex-1">
                    <h3 className="wp-body font-semibold text-wp-text-primary mb-1">Show &ldquo;Presentations&rdquo; Section</h3>
                    <p className="wp-body-small text-wp-text-secondary">Enable or disable the presentations section for all users</p>
                  </div>
                  <button
                    onClick={togglePresentations}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50 ${
                      showPresentations ? 'bg-gradient-to-r from-wp-primary to-wp-accent' : 'bg-wp-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        showPresentations ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-wp-dark-card/30 rounded-lg border border-wp-border/50">
                  <div className="flex-1">
                    <h3 className="wp-body font-semibold text-wp-text-primary mb-1">Enable Hourly Cache Cleanup</h3>
                    <p className="wp-body-small text-wp-text-secondary">Enable or disable automatic cache cleanup every hour</p>
                  </div>
                  <button
                    onClick={toggleCacheCleanup}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50 ${
                      enableCacheCleanup ? 'bg-gradient-to-r from-wp-primary to-wp-accent' : 'bg-wp-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        enableCacheCleanup ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <br />
            {/* System Operations Card */}
            <div className="wp-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-wp-purple to-wp-purple-dark rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="wp-heading-3">System Operations</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-wp-dark-card/30 rounded-lg border border-wp-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="wp-body font-semibold text-wp-text-primary mb-1">Sync Notion Data</h3>
                      <p className="wp-body-small text-wp-text-secondary">Manually trigger the Notion sync process</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerCron}
                    disabled={cronStatus.includes('Running')}
                    className="w-full wp-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cronStatus.includes('Running') ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Running...
                      </div>
                    ) : (
                      'Trigger Sync'
                    )}
                  </button>
                  {cronStatus && !cronStatus.includes('Running') && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      cronStatus.includes('successfully') 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cronStatus}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-wp-dark-card/30 rounded-lg border border-wp-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="wp-body font-semibold text-wp-text-primary mb-1">Clean Cache</h3>
                      <p className="wp-body-small text-wp-text-secondary">Manually remove expired cache entries</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerCacheCleanup}
                    disabled={cacheCleanupStatus.includes('Running')}
                    className="w-full wp-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cacheCleanupStatus.includes('Running') ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-wp-text-primary/30 border-t-wp-text-primary rounded-full animate-spin mr-2"></div>
                        Running...
                      </div>
                    ) : (
                      'Clean Cache'
                    )}
                  </button>
                  {cacheCleanupStatus && !cacheCleanupStatus.includes('Running') && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      cacheCleanupStatus.includes('successfully') || cacheCleanupStatus.includes('completed')
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cacheCleanupStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}