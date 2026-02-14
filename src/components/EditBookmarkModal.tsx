'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Type, Tag, FolderOpen, FileText, Star, Loader2 } from 'lucide-react';
import type { Bookmark, Folder } from '@/types';
import { toast } from 'sonner';

interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: Bookmark;
  folders: Folder[];
}

export function EditBookmarkModal({ isOpen, onClose, bookmark, folders }: EditBookmarkModalProps) {
  const supabase = createClient();
  const [url, setUrl] = useState(bookmark.url);
  const [title, setTitle] = useState(bookmark.title);
  const [description, setDescription] = useState(bookmark.description || '');
  const [folderId, setFolderId] = useState<string | null>(bookmark.folder_id);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(bookmark.tags || []);
  const [isFavorite, setIsFavorite] = useState(bookmark.is_favorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUrl(bookmark.url);
    setTitle(bookmark.title);
    setDescription(bookmark.description || '');
    setFolderId(bookmark.folder_id);
    setTags(bookmark.tags || []);
    setIsFavorite(bookmark.is_favorite);
  }, [bookmark]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) {
      toast.error('URL and Title are required');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('bookmarks')
      .update({
        url,
        title: title.trim(),
        description: description.trim() || null,
        folder_id: folderId,
        tags,
        is_favorite: isFavorite,
      })
      .eq('id', bookmark.id);

    if (error) {
      toast.error('Failed to update bookmark');
    } else {
      toast.success('Bookmark updated!');
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg rounded-2xl p-6 z-10"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Bookmark</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--primary-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <LinkIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  URL
                </label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="input" required />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <Type className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  Title
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                    <FolderOpen className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    Folder
                  </label>
                  <select value={folderId || ''} onChange={(e) => setFolderId(e.target.value || null)} className="input">
                    <option value="">No folder</option>
                    {folders.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 rounded-xl transition-all"
                    style={{
                      background: isFavorite ? 'rgba(251,191,36,0.15)' : 'var(--background)',
                      border: `1px solid ${isFavorite ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    <Star className="w-5 h-5" style={{ color: isFavorite ? '#fbbf24' : 'var(--muted)', fill: isFavorite ? '#fbbf24' : 'none' }} />
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <Tag className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="input text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
