'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/app/dashboard/layout';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, FolderOpen, Star, Home, LogOut, Plus,
  ChevronLeft, ChevronRight, Sun, Moon, Search,
  Settings, Tag, X,
  Share,
} from 'lucide-react';
import { useState } from 'react';
import type { Folder } from '@/types';
import { toast } from 'sonner';

const FOLDER_COLORS = [
  '#6366f1', '#a78bfa', '#f472b6', '#f87171', '#fb923c',
  '#fbbf24', '#34d399', '#06b6d4', '#3b82f6', '#8b5cf6',
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const {
    user, folders, selectedFolderId, setSelectedFolderId,
    showFavorites, setShowFavorites, searchQuery, setSearchQuery,
    refreshFolders,
  } = useDashboard();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from('folders').insert({
      name: newFolderName.trim(),
      color: newFolderColor,
      user_id: user?.id,
    });
    if (error) {
      toast.error('Failed to create folder');
    } else {
      toast.success('Folder created!');
      setNewFolderName('');
      setShowNewFolder(false);
      refreshFolders();
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (error) {
      toast.error('Failed to delete folder');
    } else {
      if (selectedFolderId === folderId) setSelectedFolderId(null);
      toast.success('Folder deleted');
      refreshFolders();
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder) return;
    const { error } = await supabase
      .from('folders')
      .update({ name: editingFolder.name, color: editingFolder.color })
      .eq('id', editingFolder.id);
    if (!error) {
      toast.success('Folder updated');
      refreshFolders();
    }
    setEditingFolder(null);
  };

  const handleShareFolder = async (folderId: string, userId: string) => {
    await supabase
      .from('folders')
      .update({ is_shared: true, shared_with: supabase.fn.array_append('shared_with', userId) })
      .eq('id', folderId);
    toast.success('Folder shared!');
  };

  return (
    <motion.aside
      animate={{ width: isOpen ? 280 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">MarkVault</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--primary-muted)]"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      {isOpen && (
        <div className="px-4 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-sm"
              style={{ fontSize: '13px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3 h-3" style={{ color: 'var(--muted)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Main nav */}
        <div className="space-y-1 mb-4">
          <NavItem
            icon={<Home className="w-4 h-4" />}
            label="All Bookmarks"
            active={!selectedFolderId && !showFavorites}
            collapsed={!isOpen}
            onClick={() => { setSelectedFolderId(null); setShowFavorites(false); }}
          />
          <NavItem
            icon={<Star className="w-4 h-4" />}
            label="Favorites"
            active={showFavorites}
            collapsed={!isOpen}
            onClick={() => { setShowFavorites(true); setSelectedFolderId(null); }}
          />
          <NavItem
            icon={<Tag className="w-4 h-4" />}
            label="Tags"
            active={false}
            collapsed={!isOpen}
            onClick={() => {}}
          />
        </div>

        {/* Folders */}
        {isOpen && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Folders
              </span>
              <button
                onClick={() => setShowNewFolder(!showNewFolder)}
                className="p-1 rounded-md hover:bg-[var(--primary-muted)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              </button>
            </div>

            {/* New folder form */}
            <AnimatePresence>
              {showNewFolder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 mb-2"
                >
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <input
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      className="input text-sm mb-2"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {FOLDER_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewFolderColor(color)}
                          className="w-5 h-5 rounded-full transition-transform"
                          style={{
                            background: color,
                            transform: newFolderColor === color ? 'scale(1.3)' : 'scale(1)',
                            boxShadow: newFolderColor === color ? `0 0 0 2px var(--background), 0 0 0 4px ${color}` : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCreateFolder} className="btn-primary text-xs py-1.5 px-3 flex-1">
                        Create
                      </button>
                      <button onClick={() => setShowNewFolder(false)} className="btn-ghost text-xs py-1.5 px-3">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Folder list */}
            <div className="space-y-0.5">
              {folders.map((folder) => (
                <div key={folder.id} className="group relative">
                  {editingFolder?.id === folder.id ? (
                    <div className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFolder.name}
                        onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameFolder();
                          if (e.key === 'Escape') setEditingFolder(null);
                        }}
                        className="input text-sm"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                        {FOLDER_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingFolder({ ...editingFolder, color })}
                            className="w-4 h-4 rounded-full transition-transform"
                            style={{
                              background: color,
                              transform: editingFolder.color === color ? 'scale(1.3)' : 'scale(1)',
                              boxShadow: editingFolder.color === color ? `0 0 0 2px var(--background), 0 0 0 3px ${color}` : 'none',
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleRenameFolder} className="btn-primary text-xs py-1 px-2 flex-1">Save</button>
                        <button onClick={() => setEditingFolder(null)} className="btn-ghost text-xs py-1 px-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedFolderId(folder.id); setShowFavorites(false); }}
                      onDoubleClick={() => setEditingFolder(folder)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: selectedFolderId === folder.id ? 'var(--primary-muted)' : 'transparent',
                        color: selectedFolderId === folder.id ? 'var(--primary)' : 'var(--foreground)',
                      }}
                    >
                      <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
                      <span className="truncate flex-1 text-left">{folder.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[rgba(248,113,113,0.1)] transition-all"
                      >
                        <X className="w-3 h-3" style={{ color: 'var(--danger)' }} />
                      </button>
                      <button
                        className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]"
                        title="Share Folder"
                        onClick={() => {
                          const userId = prompt('Enter user ID to share with:');
                          if (userId) handleShareFolder(folder.id, userId);
                        }}
                      >
                        <Share className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                      </button>
                    </button>
                  )}
                </div>
              ))}
              {folders.length === 0 && (
                <p className="text-xs px-3 py-4 text-center" style={{ color: 'var(--muted)' }}>
                  No folders yet. Create one!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        <NavItem
          icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          active={false}
          collapsed={!isOpen}
          onClick={toggleTheme}
        />
        {isOpen && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                <span className="text-white text-sm font-medium">
                  {user.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{user.email}</p>
            </div>
          </div>
        )}
        <NavItem
          icon={<LogOut className="w-4 h-4" />}
          label="Sign Out"
          active={false}
          collapsed={!isOpen}
          onClick={handleSignOut}
        />
      </div>
    </motion.aside>
  );
}

function NavItem({
  icon, label, active, collapsed, onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
      style={{
        background: active ? 'var(--primary-muted)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--foreground)',
      }}
    >
      {icon}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
