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

// Background script for handling tab title modifications

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Title Modifier extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ 
          url: tabs[0].url, 
          title: tabs[0].title,
          tabId: tabs[0].id 
        });
      }
    });
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'updateTitle') {
    chrome.tabs.sendMessage(message.tabId, { 
      action: 'setTitle', 
      title: message.title 
    });
  }
  
  if (message.action === 'resetTitle') {
    chrome.tabs.sendMessage(message.tabId, { 
      action: 'resetTitle' 
    });
  }
}); 