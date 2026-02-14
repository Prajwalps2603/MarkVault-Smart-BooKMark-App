export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  folder_id: string | null;
  tags: string[];
  is_favorite: boolean;
  og_image: string | null;
  visit_count?: number;
  last_visited?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortBy = 'created_at' | 'title' | 'url';
export type SortOrder = 'asc' | 'desc';
