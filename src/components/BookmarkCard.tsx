'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Bookmark, Folder, ViewMode } from '@/types';
import {
  Star, Trash2, ExternalLink, MoreHorizontal, Edit2,
  FolderOpen, Copy, Check, GripVertical, Clock, FileText,
  Archive, Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { EditBookmarkModal } from './EditBookmarkModal';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: ViewMode;
  folders: Folder[];
  onTagClick?: (tag: string) => void;
}

export function BookmarkCard({ bookmark, viewMode, folders, onTagClick }: BookmarkCardProps) {
  const supabase = createClient();
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderAt, setReminderAt] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const folder = folders.find(f => f.id === bookmark.folder_id);

  const toggleFavorite = async () => {
    await supabase
      .from('bookmarks')
      .update({ is_favorite: !bookmark.is_favorite })
      .eq('id', bookmark.id);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmark.id);
    if (!error) toast.success('Bookmark deleted');
    else toast.error('Failed to delete');
    setShowMenu(false);
    setConfirmDelete(false);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=64`;

  const handleOpenBookmark = async () => {
    // Open bookmark and update analytics
    window.open(bookmark.url, '_blank');
    await supabase
      .from('bookmarks')
      .update({
        visit_count: (bookmark.visit_count || 0) + 1,
        last_visited: new Date().toISOString(),
      })
      .eq('id', bookmark.id);
  };

  const handleSetReminder = async () => {
    if (!reminderAt) return;
    await supabase
      .from('reminders')
      .insert({ bookmark_id: bookmark.id, user_id: bookmark.user_id, remind_at: reminderAt });
    toast.success('Reminder set!');
    setShowReminderModal(false);
  };

  const handleSummarize = async () => {
    setShowSummaryModal(true);
    setSummary('Summarizing...');
    try {
      // Example: Use OpenAI or other API
      const response = await fetch(`/api/summarize?url=${encodeURIComponent(bookmark.url)}`);
      const data = await response.json();
      setSummary(data.summary || 'No summary available');
    } catch {
      setSummary('Failed to summarize');
    }
  };

  // Archiving logic
  const handleArchive = async () => {
    await supabase
      .from('bookmarks')
      .update({ is_archived: true })
      .eq('id', bookmark.id);
    toast.success('Bookmark archived');
  };
  const handleUnarchive = async () => {
    await supabase
      .from('bookmarks')
      .update({ is_archived: false })
      .eq('id', bookmark.id);
    toast.success('Bookmark restored');
  };

  // Update icon colors for light mode visibility
  const iconColor = 'var(--muted-foreground)';

  // List view
  if (viewMode === 'list') {
    return (
      <>
        <div
          className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.005] group"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <img src={faviconUrl} alt="" className="w-8 h-8 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{bookmark.title}</h3>
              {folder && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${folder.color}20`, color: folder.color }}>
                  {folder.name}
                </span>
              )}
            </div>
            <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{getDomain(bookmark.url)}</p>
          </div>
          {bookmark.tags?.map(tag => (
            <button key={tag} onClick={() => onTagClick?.(tag)} className="tag hidden lg:inline-flex">{tag}</button>
          ))}
          <span className="text-xs hidden md:block" style={{ color: 'var(--muted)' }}>
            {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={toggleFavorite} className="p-2 rounded-lg transition-colors hover:bg-[var(--primary-muted)]">
              <Star className="w-4 h-4" style={{ color: bookmark.is_favorite ? '#fbbf24' : iconColor, fill: bookmark.is_favorite ? '#fbbf24' : 'none' }} />
            </button>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg transition-colors hover:bg-[var(--primary-muted)]">
              <ExternalLink className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            </a>
            <button onClick={handleCopyUrl} className="p-2 rounded-lg transition-colors hover:bg-[var(--primary-muted)]">
              {copied ? <Check className="w-4 h-4" style={{ color: 'var(--success)' }} /> : <Copy className="w-4 h-4" style={{ color: 'var(--muted)' }} />}
            </button>
            <button onClick={() => setShowEdit(true)} className="p-2 rounded-lg transition-colors hover:bg-[var(--primary-muted)]">
              <Edit2 className="w-4 h-4" style={{ color: iconColor }} />
            </button>
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg transition-colors hover:bg-[rgba(248,113,113,0.1)]" title="Delete bookmark">
              <Trash2 className="w-4 h-4" style={{ color: 'var(--danger)' }} />
            </button>
            <button onClick={() => setShowReminderModal(true)} className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]" title="Set Reminder">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
            </button>
            <button onClick={handleSummarize} className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]" title="Summarize">
              <FileText className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
            </button>
            {bookmark.is_archived ? (
              <button onClick={handleUnarchive} className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]" title="Restore">
                <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              </button>
            ) : (
              <button onClick={handleArchive} className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]" title="Archive">
                <Archive className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              </button>
            )}
          </div>
        </div>
        <EditBookmarkModal isOpen={showEdit} onClose={() => setShowEdit(false)} bookmark={bookmark} folders={folders} />
        {/* Delete confirmation */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setConfirmDelete(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                    <Trash2 className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Delete Bookmark</h3>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                  Are you sure you want to delete <strong>&quot;{bookmark.title}&quot;</strong>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                  <button onClick={handleDelete} className="btn-danger text-sm py-2 px-4">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Reminder modal */}
        <AnimatePresence>
          {showReminderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowReminderModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <h3 className="font-semibold mb-4">Set Reminder</h3>
                <input
                  type="datetime-local"
                  value={reminderAt || ''}
                  onChange={e => setReminderAt(e.target.value)}
                  className="input w-full mb-4"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowReminderModal(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                  <button onClick={handleSetReminder} className="btn-primary text-sm py-2 px-4">Set</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Summary modal */}
        <AnimatePresence>
          {showSummaryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowSummaryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <h3 className="font-semibold mb-4">Page Summary</h3>
                <div className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{summary}</div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowSummaryModal(false)} className="btn-ghost text-sm py-2 px-4">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Compact view
  if (viewMode === 'compact') {
    return (
      <>
        <div
          className="p-3 rounded-xl transition-all hover:scale-[1.02] group cursor-pointer"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          onClick={handleOpenBookmark}
        >
          <div className="flex items-center gap-2">
            <img src={faviconUrl} alt="" className="w-5 h-5 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="text-sm font-medium truncate flex-1">{bookmark.title}</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
                title="Toggle favorite"
              >
                <Star className="w-3.5 h-3.5" style={{ color: bookmark.is_favorite ? '#fbbf24' : iconColor, fill: bookmark.is_favorite ? '#fbbf24' : 'none' }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]"
                title="Edit bookmark"
              >
                <Edit2 className="w-3.5 h-3.5" style={{ color: iconColor }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                className="p-1 rounded-lg transition-colors hover:bg-[rgba(248,113,113,0.1)]"
                title="Delete bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              </button>
              <button
                onClick={() => setShowReminderModal(true)}
                className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]"
                title="Set Reminder"
              >
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              </button>
              <button
                onClick={handleSummarize}
                className="p-1 rounded-lg transition-colors hover:bg-[var(--primary-muted)]"
                title="Summarize"
              >
                <FileText className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </div>
        </div>
        <EditBookmarkModal isOpen={showEdit} onClose={() => setShowEdit(false)} bookmark={bookmark} folders={folders} />
        {/* Delete confirmation */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setConfirmDelete(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                    <Trash2 className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Delete Bookmark</h3>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                  Are you sure you want to delete <strong>&quot;{bookmark.title}&quot;</strong>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                  <button onClick={handleDelete} className="btn-danger text-sm py-2 px-4">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Reminder modal */}
        <AnimatePresence>
          {showReminderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowReminderModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <h3 className="font-semibold mb-4">Set Reminder</h3>
                <input
                  type="datetime-local"
                  value={reminderAt || ''}
                  onChange={e => setReminderAt(e.target.value)}
                  className="input w-full mb-4"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowReminderModal(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                  <button onClick={handleSetReminder} className="btn-primary text-sm py-2 px-4">Set</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Summary modal */}
        <AnimatePresence>
          {showSummaryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowSummaryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <h3 className="font-semibold mb-4">Page Summary</h3>
                <div className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{summary}</div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowSummaryModal(false)} className="btn-ghost text-sm py-2 px-4">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Grid (default) view
  return (
    <>
      <div
        className="rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg group card-gradient-border"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* OG Image or gradient header */}
        <div className="h-32 relative overflow-hidden" style={{
          background: bookmark.og_image
            ? `url(${bookmark.og_image}) center/cover`
            : `linear-gradient(135deg, ${folder?.color || '#6366f1'}30, ${folder?.color || '#a78bfa'}10)`,
        }}>
          {/* Overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent, var(--card))' }} />

          {/* Actions - always visible */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={toggleFavorite}
              className="p-1.5 rounded-lg glass"
            >
              <Star className="w-3.5 h-3.5" style={{ color: bookmark.is_favorite ? '#fbbf24' : iconColor, fill: bookmark.is_favorite ? '#fbbf24' : 'none' }} />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-lg glass"
              title="Edit bookmark"
            >
              <Edit2 className="w-3.5 h-3.5" style={{ color: iconColor }} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg glass"
              title="Delete bookmark"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
            </button>
            <button
              onClick={() => setShowReminderModal(true)}
              className="p-1.5 rounded-lg glass"
              title="Set Reminder"
            >
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
            </button>
            <button
              onClick={handleSummarize}
              className="p-1.5 rounded-lg glass"
              title="Summarize"
            >
              <FileText className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Favicon */}
          <div className="absolute bottom-2 left-3">
            <img src={faviconUrl} alt="" className="w-8 h-8 rounded-lg shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        </div>

        <div className="p-4">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:underline line-clamp-2 mb-1 block"
          >
            {bookmark.title}
          </a>
          <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <ExternalLink className="w-3 h-3" />
            {getDomain(bookmark.url)}
          </p>
          {bookmark.description && (
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
              {bookmark.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {folder && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${folder.color}20`, color: folder.color }}>
                  {folder.name}
                </span>
              )}
              {bookmark.tags?.slice(0, 2).map(tag => (
                <button key={tag} onClick={() => onTagClick?.(tag)} className="tag text-xs">{tag}</button>
              ))}
              {bookmark.tags && bookmark.tags.length > 2 && (
                <span className="tag text-xs">+{bookmark.tags.length - 2}</span>
              )}
            </div>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      <EditBookmarkModal isOpen={showEdit} onClose={() => setShowEdit(false)} bookmark={bookmark} folders={folders} />
      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                  <Trash2 className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                </div>
                <div>
                  <h3 className="font-semibold">Delete Bookmark</h3>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Are you sure you want to delete <strong>&quot;{bookmark.title}&quot;</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                <button onClick={handleDelete} className="btn-danger text-sm py-2 px-4">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Reminder modal */}
      <AnimatePresence>
        {showReminderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowReminderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              <h3 className="font-semibold mb-4">Set Reminder</h3>
              <input
                type="datetime-local"
                value={reminderAt || ''}
                onChange={e => setReminderAt(e.target.value)}
                className="input w-full mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowReminderModal(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                <button onClick={handleSetReminder} className="btn-primary text-sm py-2 px-4">Set</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Summary modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              <h3 className="font-semibold mb-4">Page Summary</h3>
              <div className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{summary}</div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowSummaryModal(false)} className="btn-ghost text-sm py-2 px-4">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
