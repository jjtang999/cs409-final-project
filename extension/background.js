const DEFAULT_API_URL = 'http://localhost:4000';

const getSettings = () =>
  new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        apiUrl: DEFAULT_API_URL,
        userId: null,
        userEmail: null,
      },
      (data) => resolve(data)
    );
  });

const shouldIgnoreUrl = (url) => {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('about:') ||
    url.startsWith(`chrome-extension://${chrome.runtime.id}`)
  );
};

const redirectToBlockedPage = (tabId, targetUrl, reason) => {
  const destination = new URL(chrome.runtime.getURL('blocked.html'));
  if (targetUrl) destination.searchParams.set('target', targetUrl);
  if (reason) destination.searchParams.set('reason', reason);
  chrome.tabs.update(tabId, { url: destination.toString() });
};

const checkWebsite = async (details) => {
  if (details.frameId !== 0 || shouldIgnoreUrl(details.url) || !details.url.startsWith('http')) {
    return;
  }

  const { apiUrl = DEFAULT_API_URL, userId } = await getSettings();
  if (!userId) {
    return;
  }

  const endpoint = `${apiUrl}/api/block-check?userId=${encodeURIComponent(
    userId
  )}&url=${encodeURIComponent(details.url)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (data.blocked) {
      redirectToBlockedPage(details.tabId, details.url, data.reason || 'Blocked by schedule');
    }
  } catch (error) {
    console.error('FocusBlock Shield error:', error);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('apiUrl', (data) => {
    if (!data.apiUrl) {
      chrome.storage.sync.set({ apiUrl: DEFAULT_API_URL });
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(checkWebsite);
chrome.webNavigation.onCommitted.addListener(checkWebsite);
