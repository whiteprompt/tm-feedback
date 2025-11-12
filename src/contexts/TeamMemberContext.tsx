'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { TeamMember } from '@/lib/constants';

interface TeamMemberContextType {
  teamMember: TeamMember | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TeamMemberContext = createContext<TeamMemberContextType | undefined>(undefined);

interface TeamMemberProviderProps {
  children: ReactNode;
}

export function TeamMemberProvider({ children }: TeamMemberProviderProps) {
  const { data: session } = useSession();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMember = useCallback(async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/team-member');
      
      if (response.ok) {
        const data = await response.json();
        setTeamMember(data);
      } else {
        setTeamMember(null);
      }
    } catch (err) {
      console.error('Error fetching team member:', err);
      setError('Failed to fetch team member information');
      setTeamMember(null);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeamMember();
    } else if (session === null) {
      // Session is confirmed to be null (not loading)
      setTeamMember(null);
      setLoading(false);
    }
  }, [session, fetchTeamMember]);

  const refetch = async () => {
    await fetchTeamMember();
  };

  return (
    <TeamMemberContext.Provider value={{ teamMember, loading, error, refetch }}>
      {children}
    </TeamMemberContext.Provider>
  );
}

export function useTeamMember() {
  const context = useContext(TeamMemberContext);
  if (context === undefined) {
    throw new Error('useTeamMember must be used within a TeamMemberProvider');
  }
  return context;
}