const blocked = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com"
];

const hostname = location.hostname.replace("www.", "");

if (blocked.includes(hostname)) {
  // Redirect BEFORE page loads
  const url = chrome.runtime.getURL("blocked.html");
  location.replace(url);
}
