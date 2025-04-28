/*
 * Tab Title Modifier - A Chrome extension that allows you to customize tab titles
 * Copyright (C) 2023 Tab Title Modifier Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { SavedTitle, TabInfo, MatchType } from '../types';
import { generateId, getUrlByMatchType } from '../lib/utils';

// Check if we're in a Chrome extension context
const isExtensionContext = typeof chrome !== 'undefined' && !!chrome?.runtime;

// Mock saved titles for development
const MOCK_SAVED_TITLES: SavedTitle[] = [
  {
    id: '1a2b3c',
    url: 'example.com',
    title: 'My Custom Example Title',
    matchType: 'domain',
    originalTitle: 'Example Domain',
    createdAt: Date.now() - 86400000
  },
  {
    id: '4d5e6f',
    url: 'https://example.com/some/path',
    title: 'Custom Path Title',
    matchType: 'path',
    originalTitle: 'Example Path Page',
    createdAt: Date.now() - 43200000
  }
];

// Mock tab info for development
const MOCK_TAB_INFO: TabInfo = {
  url: 'https://example.com/some/path?query=value#hash',
  title: 'Example Page Title',
  tabId: 123,
  originalTitle: 'Original Example Title',
  isModified: false
};

interface TitleContextType {
  currentTab: TabInfo | null;
  savedTitles: SavedTitle[];
  searchQuery: string;
  searchResults: SavedTitle[];
  loading: boolean;
  updateTitle: (title: string, matchType: MatchType) => Promise<void>;
  resetTitle: () => Promise<void>;
  deleteSavedTitle: (id: string) => Promise<void>;
  updateSavedTitle: (savedTitle: SavedTitle) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearCurrentTabTitle: () => Promise<void>;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export function TitleProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<TabInfo | null>(null);
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedTitle[]>([]);

  // Initialize fuse for fuzzy search
  const fuse = new Fuse(savedTitles, {
    keys: ['title', 'url', 'originalTitle'],
    threshold: 0.4,
  });

  // Load saved titles from storage
  useEffect(() => {
    try {
      if (isExtensionContext) {
        chrome.storage.local.get('savedTitles', (data) => {
          if (data?.savedTitles) {
            setSavedTitles(data.savedTitles);
          }
          setLoading(false);
        });
      } else {
        // Use mock data for development
        setSavedTitles(MOCK_SAVED_TITLES);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading saved titles:', error);
      setSavedTitles(MOCK_SAVED_TITLES);
      setLoading(false);
    }
  }, []);

  // Update search results when query or saved titles change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(savedTitles);
    } else {
      const results = fuse.search(searchQuery).map(result => result.item);
      setSearchResults(results);
    }
  }, [searchQuery, savedTitles]);

  // Get current tab info
  useEffect(() => {
    try {
      if (isExtensionContext) {
        chrome.runtime.sendMessage({ action: 'getTabInfo' }, (response) => {
          if (response) {
            setCurrentTab(response);
            
            // Get original title from content script
            chrome.tabs.sendMessage(response.tabId, { action: 'getOriginalTitle' }, (titleInfo) => {
              if (titleInfo && chrome.runtime.lastError === undefined) {
                setCurrentTab(prev => prev ? {
                  ...prev,
                  originalTitle: titleInfo.originalTitle,
                  isModified: titleInfo.isModified
                } : null);
              }
            });
          }
        });
      } else {
        // Use mock data for development
        setCurrentTab(MOCK_TAB_INFO);
      }
    } catch (error) {
      console.error('Error getting current tab info:', error);
      setCurrentTab(MOCK_TAB_INFO);
    }
  }, []);

  // Save titles to storage
  const saveTitlesToStorage = async (titles: SavedTitle[]) => {
    return new Promise<void>((resolve) => {
      try {
        if (isExtensionContext) {
          chrome.storage.local.set({ savedTitles: titles }, () => {
            resolve();
          });
        } else {
          console.log('Development mode: Saved titles to mock storage', titles);
          resolve();
        }
      } catch (error) {
        console.error('Error saving titles to storage:', error);
        resolve();
      }
    });
  };

  // Update title
  const updateTitle = async (title: string, matchType: MatchType) => {
    if (!currentTab) return;

    const url = getUrlByMatchType(currentTab.url, matchType);
    
    try {
      // Update the title in the page
      if (isExtensionContext) {
        chrome.runtime.sendMessage({
          action: 'updateTitle',
          tabId: currentTab.tabId,
          title
        });
      } else {
        console.log('Development mode: Update title', { tabId: currentTab.tabId, title });
      }
    } catch (error) {
      console.error('Error updating title:', error);
    }

    // Find if this URL with this match type already exists
    const existingTitleIndex = savedTitles.findIndex(
      item => item.url === url && item.matchType === matchType
    );

    let updatedTitles;
    if (existingTitleIndex > -1) {
      // Update existing entry
      const existingTitle = savedTitles[existingTitleIndex];
      const updatedTitle = {
        ...existingTitle,
        title,
        // Keep the original title from when it was first created
        originalTitle: existingTitle.originalTitle,
        // Update the timestamp to move it to the top
        createdAt: Date.now()
      };
      
      // Remove the existing entry and add the updated one
      updatedTitles = [...savedTitles];
      updatedTitles.splice(existingTitleIndex, 1);
      updatedTitles = [updatedTitle, ...updatedTitles];
    } else {
      // Create a new entry
      const newTitle: SavedTitle = {
        id: generateId(),
        url,
        title,
        matchType,
        originalTitle: currentTab.originalTitle || currentTab.title,
        createdAt: Date.now()
      };
      
      // Add the new entry at the top
      updatedTitles = [newTitle, ...savedTitles];
    }
    
    setSavedTitles(updatedTitles);
    await saveTitlesToStorage(updatedTitles);

    // Update current tab info
    setCurrentTab(prev => prev ? {
      ...prev,
      isModified: true
    } : null);
  };

  // Reset title
  const resetTitle = async () => {
    if (!currentTab) return;

    try {
      if (isExtensionContext) {
        chrome.runtime.sendMessage({
          action: 'resetTitle',
          tabId: currentTab.tabId
        });
      } else {
        console.log('Development mode: Reset title', { tabId: currentTab.tabId });
      }
    } catch (error) {
      console.error('Error resetting title:', error);
    }

    // Update current tab info
    setCurrentTab(prev => prev ? {
      ...prev,
      isModified: false
    } : null);
  };

  // Delete saved title
  const deleteSavedTitle = async (id: string) => {
    // Find the title being deleted
    const titleToDelete = savedTitles.find(title => title.id === id);
    const updatedTitles = savedTitles.filter(title => title.id !== id);
    setSavedTitles(updatedTitles);
    await saveTitlesToStorage(updatedTitles);

    // Check if this title was being applied to the current tab
    if (currentTab && titleToDelete) {
      const currentUrl = getUrlByMatchType(currentTab.url, titleToDelete.matchType);
      
      // If the deleted title was being applied to the current tab, reset the title
      if (currentUrl === titleToDelete.url) {
        try {
          if (isExtensionContext) {
            chrome.runtime.sendMessage({
              action: 'resetTitle',
              tabId: currentTab.tabId
            });
          } else {
            console.log('Development mode: Reset title after deletion', { tabId: currentTab.tabId });
          }
          
          // Update current tab info
          setCurrentTab(prev => prev ? {
            ...prev,
            isModified: false
          } : null);
        } catch (error) {
          console.error('Error resetting title after deletion:', error);
        }
      }
    }
  };

  // Update saved title
  const updateSavedTitle = async (updatedTitle: SavedTitle) => {
    const updatedTitles = savedTitles.map(title => 
      title.id === updatedTitle.id ? updatedTitle : title
    );
    setSavedTitles(updatedTitles);
    await saveTitlesToStorage(updatedTitles);
  };

  // Clear current tab title (find and delete entry for current URL if exists)
  const clearCurrentTabTitle = async () => {
    if (!currentTab) return;
    
    // First reset the title visually
    await resetTitle();
    
    // Find saved titles for the current URL across all match types
    const matchingTitles: SavedTitle[] = [];
    
    // Check each match type
    const matchTypes: MatchType[] = ['exact', 'path', 'domain'];
    for (const type of matchTypes) {
      const url = getUrlByMatchType(currentTab.url, type);
      const match = savedTitles.find(title => 
        title.matchType === type && title.url === url
      );
      if (match) {
        matchingTitles.push(match);
      }
    }
    
    // Delete all matching titles
    if (matchingTitles.length > 0) {
      const updatedTitles = savedTitles.filter(title => 
        !matchingTitles.some(match => match.id === title.id)
      );
      setSavedTitles(updatedTitles);
      await saveTitlesToStorage(updatedTitles);
    }
    
    // Make sure current tab info is reset
    setCurrentTab(prev => prev ? {
      ...prev,
      isModified: false,
      title: prev.originalTitle || prev.title
    } : null);
  };

  return (
    <TitleContext.Provider
      value={{
        currentTab,
        savedTitles,
        searchQuery,
        searchResults,
        loading,
        updateTitle,
        resetTitle,
        deleteSavedTitle,
        updateSavedTitle,
        setSearchQuery,
        clearCurrentTabTitle
      }}
    >
      {children}
    </TitleContext.Provider>
  );
}

export function useTitleContext() {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error('useTitleContext must be used within a TitleProvider');
  }
  return context;
} 