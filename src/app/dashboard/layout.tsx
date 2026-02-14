'use client';

import { useState, useEffect, useMemo, useCallback, createContext, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/Sidebar';
import type { Folder } from '@/types';

interface DashboardContextType {
  user: User | null;
  folders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  showFavorites: boolean;
  setShowFavorites: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refreshFolders: () => void;
}

const DashboardContext = createContext<DashboardContextType>({} as DashboardContextType);
export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  const refreshFolders = useCallback(async () => {
    const { data } = await supabase
      .from('folders')
      .select('*')
      .order('name');
    if (data) setFolders(data);
  }, [supabase]);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  // Real-time folder subscription with polling fallback
  useEffect(() => {
    if (!user) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(refreshFolders, 8000);
    };

    const channel = supabase
      .channel('db-folders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders' },
        (payload: {
          eventType: string;
          new: Record<string, unknown> | null;
          old: Record<string, unknown> | null;
        }) => {
          const newRow = payload.new as Record<string, unknown> | undefined;
          const oldRow = payload.old as Record<string, unknown> | undefined;
          const rowUserId = newRow?.user_id || oldRow?.user_id;
          if (rowUserId && rowUserId !== user.id) return;

          if (payload.eventType === 'INSERT') {
            setFolders((prev) => {
              const maybeNew = payload.new;
              // Check for null and required properties before casting
              if (
                maybeNew &&
                typeof maybeNew === 'object' &&
                'id' in maybeNew &&
                'user_id' in maybeNew &&
                'name' in maybeNew &&
                'color' in maybeNew &&
                'icon' in maybeNew &&
                'created_at' in maybeNew &&
                'updated_at' in maybeNew
              ) {
                const f = maybeNew as Folder;
                if (prev.some((x) => x.id === f.id)) return prev;
                return [...prev, f].sort((a, b) => a.name.localeCompare(b.name));
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Folder;
            setFolders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setFolders((prev) => prev.filter((f) => f.id !== deletedId));
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          console.log('[Realtime] Folders channel connected');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[Realtime] Folders: falling back to polling');
          startPolling();
        }
      });

    startPolling();

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user, supabase, refreshFolders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        user, folders, selectedFolderId, setSelectedFolderId,
        showFavorites, setShowFavorites, searchQuery, setSearchQuery,
        refreshFolders,
      }}
    >
      <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: sidebarOpen ? '280px' : '72px' }}
        >
          {children}
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
