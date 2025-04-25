import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Declare chrome property on Window interface
declare global {
  interface Window {
    chrome?: any;
  }
}

// Check if we're in a browser extension context
const isExtensionContext = !!window.chrome?.runtime?.id;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// For development only: simulate extension behavior
if (!isExtensionContext && process.env.NODE_ENV === 'development') {
  // Mock chrome API for development
  window.chrome = window.chrome || {
    runtime: {
      sendMessage: (message: any, callback: any) => {
        console.log('Mock sendMessage:', message);
        if (message.action === 'getTabInfo') {
          setTimeout(() => {
            callback({
              url: 'https://example.com/some/path?query=value#hash',
              title: 'Example Page Title',
              tabId: 123
            });
          }, 100);
        }
      },
      onMessage: {
        addListener: () => {}
      }
    },
    tabs: {
      query: (_: any, callback: any) => {
        callback([{
          url: 'https://example.com/some/path?query=value#hash',
          title: 'Example Page Title',
          id: 123
        }]);
      },
      sendMessage: (tabId: number, message: any, callback: any) => {
        console.log('Mock tabs.sendMessage:', tabId, message);
        if (message.action === 'getOriginalTitle') {
          setTimeout(() => {
            callback && callback({
              originalTitle: 'Original Example Title',
              currentTitle: 'Example Page Title',
              isModified: false
            });
          }, 100);
        }
      }
    },
    storage: {
      local: {
        get: (keys: string, callback: any) => {
          console.log('Mock storage.local.get:', keys);
          if (keys === 'savedTitles') {
            callback({
              savedTitles: [
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
              ]
            });
          } else {
            callback({});
          }
        },
        set: (items: any, callback: any) => {
          console.log('Mock storage.local.set:', items);
          callback && callback();
        }
      }
    }
  };
}
