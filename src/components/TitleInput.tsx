import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTitleContext } from '@/contexts/TitleContext';
import { MatchType } from '@/types';
import { getUrlByMatchType } from '@/lib/utils';

export function TitleInput() {
  const { currentTab, savedTitles, updateTitle, clearCurrentTabTitle } = useTitleContext();
  const [titleValue, setTitleValue] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('exact');
  const [existingSavedTitle, setExistingSavedTitle] = useState<boolean>(false);
  
  // Find existing saved title for current URL
  const findSavedTitleForCurrentURL = () => {
    if (!currentTab || !savedTitles.length) return null;
    
    // Check all match types in order of specificity
    const matchTypes: MatchType[] = ['exact', 'path', 'domain'];
    
    for (const type of matchTypes) {
      const url = getUrlByMatchType(currentTab.url, type);
      const match = savedTitles.find(title => 
        title.matchType === type && title.url === url
      );
      if (match) return match;
    }
    
    return null;
  };
  
  useEffect(() => {
    if (currentTab) {
      // First check if there's already a saved title for this URL
      const savedTitle = findSavedTitleForCurrentURL();
      
      if (savedTitle) {
        // Use the saved title and match type if found
        setTitleValue(savedTitle.title);
        setMatchType(savedTitle.matchType);
        setExistingSavedTitle(true);
      } else {
        // Otherwise use the current tab title
        setTitleValue(currentTab.title);
        setExistingSavedTitle(false);
      }
    }
  }, [currentTab, savedTitles]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleValue.trim()) {
      updateTitle(titleValue, matchType);
      // No need to reset form values as we want to keep them
    }
  };
  
  const handleClear = async () => {
    if (confirm("Are you sure you want to remove the saved title for this website?")) {
      await clearCurrentTabTitle();
      
      // Reset the title input to the original title after clearing
      if (currentTab?.originalTitle) {
        setTitleValue(currentTab.originalTitle);
      }
    }
  };
  
  if (!currentTab) {
    return <div className="p-4 text-center text-slate-500">Loading...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <label htmlFor="title-input" className="text-sm font-medium">
          Tab Title
        </label>
        <Input
          id="title-input"
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
          placeholder="Enter custom title"
          className={currentTab.isModified ? '' : 'text-slate-500'}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Match Type</label>
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant={matchType === 'domain' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMatchType('domain')}
          >
            Domain
          </Button>
          <Button 
            type="button" 
            variant={matchType === 'path' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMatchType('path')}
          >
            Path
          </Button>
          <Button 
            type="button" 
            variant={matchType === 'exact' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMatchType('exact')}
          >
            Exact
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          Save
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClear}
          disabled={!existingSavedTitle}
        >
          Clear
        </Button>
      </div>
    </form>
  );
} 