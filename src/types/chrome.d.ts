// Type declarations for Chrome extension API
interface Chrome {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
    };
    lastError?: Error;
  };
  tabs: {
    query: (queryInfo: { active: boolean, currentWindow: boolean }, callback: (tabs: any[]) => void) => void;
    sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
  };
  storage: {
    local: {
      get: (keys: string | string[] | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  };
}

declare const chrome: Chrome; 