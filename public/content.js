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

// Content script for interacting with web pages

let originalTitle = document.title;
let modifiedByExtension = false;
let customTitle = null;

// Check if there's a saved title for this URL
function checkForSavedTitle() {
  chrome.storage.local.get('savedTitles', (data) => {
    if (!data.savedTitles) return;
    
    const url = window.location.href;
    const hostname = window.location.hostname;
    const pathUrl = window.location.origin + window.location.pathname;
    
    // Find the most recent matching title based on matching pattern
    let matchingTitle = null;
    let matchPriority = 0; // 0: none, 1: domain, 2: path, 3: exact
    
    data.savedTitles.forEach(item => {
      if (item.matchType === 'exact' && item.url === url && 3 > matchPriority) {
        matchingTitle = item;
        matchPriority = 3;
      } else if (item.matchType === 'path' && item.url === pathUrl && 2 > matchPriority) {
        matchingTitle = item;
        matchPriority = 2;
      } else if (item.matchType === 'domain' && item.url === hostname && 1 > matchPriority) {
        matchingTitle = item;
        matchPriority = 1;
      }
    });
    
    if (matchingTitle) {
      setExtensionTitle(matchingTitle.title);
    }
  });
}

// Set the title from our extension
function setExtensionTitle(title) {
  customTitle = title;
  document.title = title;
  modifiedByExtension = true;
}

// Reset to original title
function resetToOriginalTitle() {
  customTitle = null;
  document.title = originalTitle;
  modifiedByExtension = false;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setTitle') {
    if (!modifiedByExtension) {
      originalTitle = document.title;
    }
    setExtensionTitle(message.title);
  }
  
  if (message.action === 'resetTitle') {
    resetToOriginalTitle();
  }
  
  if (message.action === 'getOriginalTitle') {
    sendResponse({ 
      originalTitle: originalTitle,
      currentTitle: document.title,
      isModified: modifiedByExtension
    });
  }
  
  return true; // Required for async sendResponse
});

// Override the document.title property to catch direct assignments
const titleDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
Object.defineProperty(document, 'title', {
  get: function() {
    return titleDescriptor.get.call(this);
  },
  set: function(newValue) {
    if (!modifiedByExtension) {
      originalTitle = newValue;
      titleDescriptor.set.call(this, newValue);
    } else if (customTitle && newValue !== customTitle) {
      // Site is trying to change the title, but we want to keep our custom one
      setTimeout(() => {
        titleDescriptor.set.call(this, customTitle);
      }, 0);
    } else {
      titleDescriptor.set.call(this, newValue);
    }
  }
});

// Run when the page loads
checkForSavedTitle();

// Listen for page title changes not caused by our extension
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (!modifiedByExtension) {
      originalTitle = document.title;
    } else if (customTitle && document.title !== customTitle) {
      // Title was changed by the page, reapply our custom title
      setTimeout(() => document.title = customTitle, 0);
    }
  }
});

observer.observe(document.querySelector('title') || document.head, {
  subtree: true,
  characterData: true,
  childList: true
});

// Also listen for navigation changes in SPAs
window.addEventListener('popstate', () => {
  setTimeout(checkForSavedTitle, 100);
});

// Listen for possible SPA navigation using URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    setTimeout(() => {
      if (!modifiedByExtension) {
        originalTitle = document.title;
      }
      checkForSavedTitle();
    }, 100);
  }
}).observe(document, {subtree: true, childList: true}); 