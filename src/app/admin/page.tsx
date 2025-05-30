'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminPage() {
  const [showContracts, setShowContracts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState('');
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
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setShowContracts(data.value.enabled);
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
        body: JSON.stringify({ enabled: newValue }),
      });

      if (response.ok) {
        setShowContracts(newValue);
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

  if (isLoading || status === 'loading') {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">Loading...</div>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            <div className="space-y-6">
              {/* Feature Toggle Section */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Toggles</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">{`Show "My Contracts" Section`}</h3>
                    <p className="text-sm text-gray-500">Enable or disable the contracts section for all users</p>
                  </div>
                  <button
                    onClick={toggleContracts}
                    className={`${
                      showContracts ? 'bg-teal-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        showContracts ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>

              {/* Cron Trigger Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Cron Jobs</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Sync Notion Data</h3>
                    <p className="text-sm text-gray-500">Manually trigger the Notion sync cron job</p>
                  </div>
                  <button
                    onClick={triggerCron}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Trigger Sync
                  </button>
                </div>
                {cronStatus && (
                  <p className={`mt-2 text-sm ${cronStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {cronStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 