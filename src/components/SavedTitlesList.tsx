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

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTitleContext } from '@/contexts/TitleContext';
import { formatUrl } from '../lib/utils';
import { SavedTitle, MatchType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Edit, Trash } from 'lucide-react';

export function SavedTitlesList() {
  const { savedTitles, searchQuery, searchResults, setSearchQuery, deleteSavedTitle, updateSavedTitle } = useTitleContext();
  const [editingTitle, setEditingTitle] = useState<SavedTitle | null>(null);
  const [editForm, setEditForm] = useState({
    url: '',
    title: '',
    matchType: 'exact' as MatchType,
  });
  
  const handleEditDialogOpen = (title: SavedTitle) => {
    setEditingTitle(title);
    setEditForm({
      url: title.url,
      title: title.title,
      matchType: title.matchType,
    });
  };
  
  const handleSaveEdit = () => {
    if (editingTitle && editForm.title.trim() && editForm.url.trim()) {
      updateSavedTitle({
        ...editingTitle,
        url: editForm.url,
        title: editForm.title,
        matchType: editForm.matchType,
      });
    }
  };
  
  const getMatchTypeLabel = (type: MatchType) => {
    switch (type) {
      case 'domain': return 'Domain';
      case 'path': return 'Path';
      case 'exact': return 'Exact';
      default: return '';
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search saved titles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-500">
          {searchQuery ? `Search Results (${searchResults.length})` : `Saved Titles (${savedTitles.length})`}
        </h3>
        
        {searchResults.length === 0 ? (
          <div className="text-center p-4 text-slate-500 text-sm">
            {searchQuery ? 'No results found' : 'No saved titles yet'}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((title) => (
              <div 
                key={title.id} 
                className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white"
              >
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{title.title}</div>
                  <div className="text-sm text-slate-500 truncate">
                    {formatUrl(title.url)}
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-slate-100">
                      {getMatchTypeLabel(title.matchType)}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem 
                          onSelect={(e) => {
                            e.preventDefault();
                            handleEditDialogOpen(title);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Title</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input 
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">URL</label>
                            <Input 
                              value={editForm.url}
                              onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Match Type</label>
                            <div className="flex space-x-2">
                              <Button 
                                type="button" 
                                variant={editForm.matchType === 'domain' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setEditForm({...editForm, matchType: 'domain'})}
                              >
                                Domain
                              </Button>
                              <Button 
                                type="button" 
                                variant={editForm.matchType === 'path' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setEditForm({...editForm, matchType: 'path'})}
                              >
                                Path
                              </Button>
                              <Button 
                                type="button" 
                                variant={editForm.matchType === 'exact' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setEditForm({...editForm, matchType: 'exact'})}
                              >
                                Exact
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={handleSaveEdit}>Save</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (confirm("Are you sure you want to delete this saved title?")) {
                          deleteSavedTitle(title.id);
                        }
                      }}
                      className="text-red-500"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 