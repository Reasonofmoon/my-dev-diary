
export interface LinkItem {
  id: string;
  name: string;
  url: string;
  description: string;
  categoryId: string;
  isPinned: boolean;
  favicon?: string;
  ogImage?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
export type LayoutType = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  layout: LayoutType;
}
