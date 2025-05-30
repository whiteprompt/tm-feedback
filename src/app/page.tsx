'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { formatDate } from '@/utils/date';

interface Allocation {
  project: string;
  start: string;
  end: string;
  active: boolean;
}

interface Contracts {
  amountType: string;
  amount: number;
  start: string;
  end?: string;
  active: boolean;
  dailyHours: number;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startDate: string;
  personalEmail: string;
  mobile: string;
  identificationType: string;
  identificationNumber: string;
  allocations?: Allocation[];
  contracts?: Contracts[];
  accesses?: string[];
}

export default function TeamMemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [showContracts, setShowContracts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setShowContracts(data.value.enabled);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [session?.user?.email]);

  const fetchTeamMemberInfo = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/team-member");

      if (!response.ok) {
        setError("Failed to fetch team member info");
      } else {
        const data = await response.json();
        setTeamMember(data);
      }
    } catch (error) {
      setError("Failed to fetch team member info");
      console.error("Error fetching team member info:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchTeamMemberInfo();
  }, [fetchTeamMemberInfo]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Main information
            </h2>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {error ? (
              <div className="px-4 py-5 sm:px-6 text-red-600">{error}</div>
            ) : !teamMember ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500">
                No information available.
              </div>
            ) : (
              <>
                <div className="px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {teamMember.firstName} {teamMember.lastName}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Work Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teamMember.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(teamMember.startDate)}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Personal Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teamMember.personalEmail}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Mobile</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teamMember.mobile}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Identification Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teamMember.identificationType}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Identification Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teamMember.identificationNumber}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Access list</dt>
                      <dd className="mt-1 text-sm text-gray-900">{(teamMember?.accesses || []).join(", ")}</dd>
                    </div>
                  </dl>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Your allocations
                  </h3>
                  {teamMember.allocations && teamMember.allocations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Project
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              End Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMember.allocations.map((allocation, index) => (
                            <tr key={index} className={allocation.active ? 'bg-teal-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {allocation.project}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {allocation.start}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {allocation.end}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No project allocations found.</p>
                  )}
                </div>
                {showContracts &&
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Your contracts
                    </h3>
                    {teamMember?.contracts && teamMember.contracts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Daily Hours
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {teamMember?.contracts?.map((contract, index) => (
                              <tr key={index} className={contract.active ? 'bg-teal-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contract.amountType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contract.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contract.dailyHours}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contract.start}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contract.end}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No contracts found.</p>
                    )}
                  </div>
                }
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 