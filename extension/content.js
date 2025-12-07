// Focus Guard - Content Script
// Runs on every page to check if it should be blocked

(async function() {
  // Get blocking state from storage
  const { blockingState } = await chrome.storage.local.get('blockingState');
  
  if (!blockingState || !blockingState.isEnabled || !blockingState.blockedUrls) {
    return;
  }

  const currentUrl = window.location.href;
  const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '');

  // Check if current site is in blocked list
  const isBlocked = blockingState.blockedUrls.some(blockedUrl => {
    const cleanBlockedUrl = blockedUrl.toLowerCase().replace(/^www\./, '');
    return hostname === cleanBlockedUrl || hostname.endsWith('.' + cleanBlockedUrl);
  });

  if (isBlocked) {
    // Redirect to blocked page
    const blockedPageUrl = chrome.runtime.getURL('blocked.html') + 
      '?url=' + encodeURIComponent(currentUrl);
    
    window.location.href = blockedPageUrl;
  }
})();

// Listen for dynamic updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockingState) {
    const newState = changes.blockingState.newValue;
    
    if (newState && newState.isEnabled && newState.blockedUrls) {
      const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '');
      
      const isBlocked = newState.blockedUrls.some(blockedUrl => {
        const cleanBlockedUrl = blockedUrl.toLowerCase().replace(/^www\./, '');
        return hostname === cleanBlockedUrl || hostname.endsWith('.' + cleanBlockedUrl);
      });

      if (isBlocked) {
        const blockedPageUrl = chrome.runtime.getURL('blocked.html') + 
          '?url=' + encodeURIComponent(window.location.href);
        window.location.href = blockedPageUrl;
      }
    }
  }
});
