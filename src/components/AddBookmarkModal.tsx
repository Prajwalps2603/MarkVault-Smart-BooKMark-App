'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Type, Tag, FolderOpen, FileText, Star, Loader2 } from 'lucide-react';
import type { Folder } from '@/types';
import { toast } from 'sonner';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  defaultFolderId?: string | null;
}

export function AddBookmarkModal({ isOpen, onClose, folders, defaultFolderId }: AddBookmarkModalProps) {
  const supabase = createClient();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId || null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [tagColor, setTagColor] = useState('#6366f1');

  useEffect(() => {
    if (defaultFolderId) setFolderId(defaultFolderId);
  }, [defaultFolderId]);

  // Auto-fetch title from URL
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl && isValidUrl(newUrl) && !title) {
      setFetching(true);
      try {
        // Try to extract domain-based title
        const domain = new URL(newUrl).hostname.replace('www.', '');
        setTitle(domain.charAt(0).toUpperCase() + domain.slice(1).split('.')[0]);
      } catch {
        // ignore
      }
      setFetching(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput) {
      e.preventDefault();
      setTags([...tags, tagInput]);
      setTagInput('');
      // Save tag color
      setTagColors({ ...tagColors, [tagInput]: tagColor });
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) {
      toast.error('URL and Title are required');
      return;
    }

    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not authenticated');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('bookmarks').insert({
      url: finalUrl,
      title: title.trim(),
      description: description.trim() || null,
      folder_id: folderId,
      tags,
      is_favorite: isFavorite,
      user_id: user.id,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(finalUrl).hostname}&sz=64`,
    });

    if (error) {
      toast.error('Failed to add bookmark');
    } else {
      toast.success('Bookmark added!');
      resetForm();
      onClose();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsFavorite(false);
    setFolderId(defaultFolderId || null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg rounded-2xl p-6 z-10"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Bookmark</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--primary-muted)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <LinkIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  URL <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="input"
                  required
                  autoFocus
                />
              </div>

              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <Type className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  Title <span style={{ color: 'var(--danger)' }}>*</span>
                  {fetching && <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--muted)' }} />}
                </label>
                <input
                  type="text"
                  placeholder="My awesome bookmark"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  Description
                </label>
                <textarea
                  placeholder="Optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Folder & Favorite row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                    <FolderOpen className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    Folder
                  </label>
                  <select
                    value={folderId || ''}
                    onChange={(e) => setFolderId(e.target.value || null)}
                    className="input"
                  >
                    <option value="">No folder</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
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

              {/* Tags */}
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

              {/* Custom tags & tag suggestions logic */}
              <div className="mb-2">
                <label className="text-xs font-medium">Tag Color</label>
                <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} className="ml-2" />
              </div>
              <div className="mb-2">
                <label className="text-xs font-medium">Suggested Tags</label>
                <div className="flex gap-1 flex-wrap">
                  {suggestedTags.map(tag => (
                    <button key={tag} className="tag text-xs" onClick={() => setTagInput(tag)}>{tag}</button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Add Bookmark'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
