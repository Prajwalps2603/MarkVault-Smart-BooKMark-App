-- ============================================
-- Smart Bookmark App - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. FOLDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT FALSE, -- collaborative folders
  shared_with UUID[] DEFAULT '{}', -- user ids
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  tag_colors JSONB DEFAULT '{}', -- custom tag colors
  is_favorite BOOLEAN DEFAULT FALSE,
  og_image TEXT,
  visit_count INT DEFAULT 0, -- analytics
  last_visited TIMESTAMPTZ, -- analytics
  reminder_at TIMESTAMPTZ, -- reminders
  is_archived BOOLEAN DEFAULT FALSE, -- archiving
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder_id ON public.bookmarks(folder_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_is_favorite ON public.bookmarks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON public.bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies: Users can only CRUD their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Folders policies: Users can only CRUD their own folders
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. REALTIME
-- ============================================
-- Enable full replica identity so DELETE events include the full row
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;
ALTER TABLE public.folders REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.folders;

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ARCHIVE TABLE (for audit/history)
CREATE TABLE IF NOT EXISTS public.bookmark_archive (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);
