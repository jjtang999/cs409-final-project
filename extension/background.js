// Focus Guard - Background Service Worker

const API_BASE_URL = 'http://localhost:5000/api';

// State
let blockingState = {
  isEnabled: false,
  blockedUrls: [],
  activeFocusSession: null,
  isInTimeBlock: false,
  lastSync: null
};

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Guard extension installed');
  syncBlockingStatus();
  
  // Set up periodic sync (every minute)
  chrome.alarms.create('syncStatus', { periodInMinutes: 1 });
});

// Handle alarm for periodic sync
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncStatus') {
    syncBlockingStatus();
  }
});

// Sync blocking status with backend
async function syncBlockingStatus() {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    
    if (!authToken) {
      blockingState.isEnabled = false;
      blockingState.blockedUrls = [];
      return;
    }

    const response = await fetch(`${API_BASE_URL}/extension/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await chrome.storage.local.remove('authToken');
        blockingState.isEnabled = false;
        blockingState.blockedUrls = [];
      }
      return;
    }

    const data = await response.json();
    
    if (data.success) {
      blockingState = {
        isEnabled: data.data.shouldBlock,
        blockedUrls: data.data.blockedUrls || [],
        activeFocusSession: data.data.activeFocusSession,
        isInTimeBlock: data.data.isInTimeBlock,
        lastSync: new Date().toISOString()
      };

      // Store in chrome storage for content script access
      await chrome.storage.local.set({ blockingState });
    }
  } catch (error) {
    console.error('Failed to sync blocking status:', error);
  }
}

// Check if URL should be blocked
function shouldBlockUrl(url) {
  if (!blockingState.isEnabled || blockingState.blockedUrls.length === 0) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    
    return blockingState.blockedUrls.some(blockedUrl => {
      const cleanBlockedUrl = blockedUrl.toLowerCase().replace(/^www\./, '');
      return hostname === cleanBlockedUrl || hostname.endsWith('.' + cleanBlockedUrl);
    });
  } catch {
    return false;
  }
}

// Handle web navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only main frame
  
  if (shouldBlockUrl(details.url)) {
    // Redirect to blocked page
    const blockedPageUrl = chrome.runtime.getURL('blocked.html') + 
      '?url=' + encodeURIComponent(details.url);
    
    chrome.tabs.update(details.tabId, { url: blockedPageUrl });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({
      ...blockingState,
      authenticated: false
    });
    
    // Also check auth
    chrome.storage.local.get('authToken').then(({ authToken }) => {
      chrome.runtime.sendMessage({
        type: 'AUTH_STATUS',
        authenticated: !!authToken
      });
    });
    
    return true;
  }

  if (message.type === 'LOGIN') {
    handleLogin(message.email, message.password)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }

  if (message.type === 'LOGOUT') {
    handleLogout()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }

  if (message.type === 'SYNC_STATUS') {
    syncBlockingStatus()
      .then(() => sendResponse({ success: true, state: blockingState }))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }

  if (message.type === 'START_QUICK_SESSION') {
    startQuickSession(message.duration)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }

  if (message.type === 'CHECK_URL') {
    sendResponse({ blocked: shouldBlockUrl(message.url) });
    return true;
  }
});

// Login handler
async function handleLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      await chrome.storage.local.set({ 
        authToken: data.data.token,
        user: data.data.user
      });
      await syncBlockingStatus();
      return { success: true, user: data.data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to server' };
  }
}

// Logout handler
async function handleLogout() {
  await chrome.storage.local.remove(['authToken', 'user']);
  blockingState = {
    isEnabled: false,
    blockedUrls: [],
    activeFocusSession: null,
    isInTimeBlock: false,
    lastSync: null
  };
  await chrome.storage.local.set({ blockingState });
}

// Start quick focus session from extension
async function startQuickSession(duration) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    
    if (!authToken) {
      return { success: false, message: 'Please log in first' };
    }

    const response = await fetch(`${API_BASE_URL}/focus-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Quick Focus Session',
        duration: duration
      })
    });

    const data = await response.json();

    if (data.success) {
      await syncBlockingStatus();
      return { success: true, session: data.data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Failed to start session' };
  }
}

// Initial sync on startup
syncBlockingStatus();
