export type MatchType = 'domain' | 'path' | 'exact';

export interface SavedTitle {
  id: string;
  url: string;
  title: string;
  matchType: MatchType;
  originalTitle: string;
  createdAt: number;
}

export interface TabInfo {
  url: string;
  title: string;
  tabId: number;
  originalTitle?: string;
  isModified?: boolean;
} 