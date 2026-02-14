'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/app/dashboard/layout';
import { BookmarkCard } from '@/components/BookmarkCard';
import { AddBookmarkModal } from '@/components/AddBookmarkModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Grid3X3, List, LayoutGrid, BookmarkIcon,
  Star, FolderOpen, Clock
} from 'lucide-react';
import type { Bookmark, ViewMode, SortBy, SortOrder } from '@/types';

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const {
    user, folders, selectedFolderId, showFavorites, searchQuery
  } = useDashboard();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all bookmarks from the database
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setBookmarks(data);
    }
    setLoading(false);
  }, [user, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Real-time bookmark subscription with polling fallback
  useEffect(() => {
    if (!user) return;

    let realtimeConnected = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    // Start polling as fallback (every 8s)
    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(fetchBookmarks, 8000);
    };

    // Attempt realtime subscription
    const channel = supabase
      .channel('db-bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        (payload) => {
          const newRow = payload.new as Record<string, unknown> | undefined;
          const oldRow = payload.old as Record<string, unknown> | undefined;
          const rowUserId = newRow?.user_id || oldRow?.user_id;
          if (rowUserId && rowUserId !== user.id) return;

          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bookmark;
            setBookmarks((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          realtimeConnected = true;
          // Realtime connected, stop polling
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          console.log('[Realtime] Bookmarks channel connected');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Realtime failed — use polling instead (no scary error)
          console.warn('[Realtime] Bookmarks: falling back to polling');
          startPolling();
        }
      });

    // Start polling immediately as a safety net; realtime will stop it if it connects
    startPolling();

    // Re-fetch on tab visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchBookmarks();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, supabase, fetchBookmarks]);

  // Apply filters/sort on top of all bookmarks
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    if (selectedFolderId) {
      result = result.filter((b) => b.folder_id === selectedFolderId);
    }
    if (showFavorites) {
      result = result.filter((b) => b.is_favorite);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    if (selectedTag) {
      result = result.filter((b) => b.tags && b.tags.includes(selectedTag));
    }

    result.sort((a, b) => {
      const aVal = sortBy === 'title' ? a.title.toLowerCase() : a.created_at;
      const bVal = sortBy === 'title' ? b.title.toLowerCase() : b.created_at;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookmarks, selectedFolderId, showFavorites, searchQuery, selectedTag, sortBy, sortOrder]);

  // Stats (from all bookmarks, not filtered)
  const totalBookmarks = filteredBookmarks.length;
  const favCount = bookmarks.filter(b => b.is_favorite).length;
  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags || [])));
  const recentCount = bookmarks.filter(b => {
    const d = new Date(b.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Most visited bookmarks
  const mostVisited = bookmarks.slice().sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0)).slice(0, 5);
  // Recently accessed bookmarks
  const recentlyAccessed = bookmarks.slice().sort((a, b) => new Date(b.last_visited || 0).getTime() - new Date(a.last_visited || 0).getTime()).slice(0, 5);
  // Tag usage stats
  const tagStats = Object.entries(
    bookmarks.reduce((acc, b) => {
      (b.tags || []).forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; });
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  // Page title
  const getTitle = () => {
    if (showFavorites) return 'Favorites';
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      return folder?.name || 'Folder';
    }
    return 'All Bookmarks';
  };

  const getIcon = () => {
    if (showFavorites) return <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />;
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      return <FolderOpen className="w-5 h-5" style={{ color: folder?.color || 'var(--primary)' }} />;
    }
    return <BookmarkIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />;
  };

  // Import/Export logic
  const handleExportCSV = () => {
    const csv = [
      'Title,URL,Description,Tags,Folder,Created At',
      ...bookmarks.map(b => [
        '"' + b.title.replace(/"/g, '""') + '"',
        '"' + b.url.replace(/"/g, '""') + '"',
        '"' + (b.description || '').replace(/"/g, '""') + '"',
        '"' + (b.tags || []).join(';') + '"',
        '"' + (folders.find(f => f.id === b.folder_id)?.name || '') + '"',
        b.created_at
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        let imported: any[] = [];
        if (file.name.endsWith('.json')) {
          imported = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          const rows = text.split('\n').slice(1);
          imported = rows.map(row => {
            const cols = row.split(',');
            return {
              title: cols[0]?.replace(/"/g, ''),
              url: cols[1]?.replace(/"/g, ''),
              description: cols[2]?.replace(/"/g, ''),
              tags: cols[3]?.replace(/"/g, '').split(';'),
              folder_id: folders.find(f => f.name === cols[4]?.replace(/"/g, ''))?.id,
              created_at: cols[5],
            };
          });
        }
        for (const b of imported) {
          await supabase.from('bookmarks').insert(b);
        }
        toast.success('Bookmarks imported!');
      } catch {
        toast.error('Import failed');
      }
    };
    reader.readAsText(file);
  };

  // Quick search & keyboard shortcuts logic
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Stats Cards */}
      {!selectedFolderId && !showFavorites && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookmarkIcon, label: 'Total Bookmarks', value: totalBookmarks, color: '#6366f1' },
            { icon: Star, label: 'Favorites', value: favCount, color: '#fbbf24' },
            { icon: FolderOpen, label: 'Folders', value: folders.length, color: '#34d399' },
            { icon: Clock, label: 'Added This Week', value: recentCount, color: '#06b6d4' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {totalBookmarks} bookmark{totalBookmarks !== 1 ? 's' : ''}
              {selectedTag && <span className="tag ml-2">{selectedTag} <button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-white">×</button></span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {([
              { mode: 'grid' as ViewMode, icon: Grid3X3 },
              { mode: 'list' as ViewMode, icon: List },
              { mode: 'compact' as ViewMode, icon: LayoutGrid },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="p-2 transition-colors"
                style={{
                  background: viewMode === mode ? 'var(--primary-muted)' : 'transparent',
                  color: viewMode === mode ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as [SortBy, SortOrder];
              setSortBy(by);
              setSortOrder(order);
            }}
            className="input text-sm py-2 px-3"
            style={{ width: 'auto' }}
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="title-asc">A → Z</option>
            <option value="title-desc">Z → A</option>
          </select>

          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Bookmark</span>
          </button>
        </div>
      </div>

      {/* Tags filter bar */}
      {allTags.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
          <button
            onClick={() => setSelectedTag(null)}
            className="tag transition-all text-xs"
            style={{
              background: !selectedTag ? 'var(--primary)' : 'var(--primary-muted)',
              color: !selectedTag ? 'white' : 'var(--primary)',
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className="tag transition-all text-xs"
              style={{
                background: selectedTag === tag ? 'var(--primary)' : 'var(--primary-muted)',
                color: selectedTag === tag ? 'white' : 'var(--primary)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Add import/export buttons */}
      <div className="flex gap-2 mb-6">
        <button className="btn-primary" onClick={handleExportCSV}>Export CSV</button>
        <button className="btn-primary" onClick={handleExportJSON}>Export JSON</button>
        <label className="btn-primary cursor-pointer">
          Import
          <input type="file" accept=".csv,.json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Bookmarks Grid/List */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-48" />
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'var(--primary-muted)' }}>
            <BookmarkIcon className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            {searchQuery ? 'No results found. Try a different search.' : 'Add your first bookmark to get started!'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Your First Bookmark
            </button>
          )}
        </motion.div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
        }`}>
          <AnimatePresence mode="popLayout">
            {filteredBookmarks.map((bookmark, i) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
                layout
              >
                <BookmarkCard
                  bookmark={bookmark}
                  viewMode={viewMode}
                  folders={folders}
                  onTagClick={setSelectedTag}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        folders={folders}
        defaultFolderId={selectedFolderId}
      />

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-bold mb-1">Most Visited</h3>
            <ul>
              {mostVisited.map(b => (
                <li key={b.id} className="flex items-center gap-2 text-xs mb-1">
                  <span>{b.title}</span>
                  <span className="ml-auto text-muted">{b.visit_count || 0} visits</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1">Recently Accessed</h3>
            <ul>
              {recentlyAccessed.map(b => (
                <li key={b.id} className="flex items-center gap-2 text-xs mb-1">
                  <span>{b.title}</span>
                  <span className="ml-auto text-muted">{b.last_visited ? new Date(b.last_visited).toLocaleString() : 'Never'}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1">Tag Usage</h3>
            <ul>
              {tagStats.map(([tag, count]) => (
                <li key={tag} className="flex items-center gap-2 text-xs mb-1">
                  <span>{tag}</span>
                  <span className="ml-auto text-muted">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-lg"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input w-full mb-4"
                placeholder="Quick search bookmarks..."
              />
              <ul>
                {quickSearchResults.map(b => (
                  <li key={b.id} className="mb-2">
                    <span className="font-medium">{b.title}</span>
                    <span className="ml-2 text-xs text-muted">{b.url}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setSearchOpen(false)} className="btn-ghost text-sm py-2 px-4">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
