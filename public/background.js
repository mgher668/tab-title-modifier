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