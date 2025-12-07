# Focus Guard Chrome Extension

A Chrome extension that blocks distracting websites during focus sessions and scheduled time blocks.

## Features

- 🔐 **User Authentication** - Sign in with your Focus Guard account
- 🛡️ **Website Blocking** - Automatically blocks sites from your blocklist
- ⏱️ **Focus Sessions** - Start quick focus sessions directly from the extension
- 📅 **Scheduled Blocks** - Respects time blocks configured in the web app
- 🔄 **Real-time Sync** - Syncs with the backend every minute

## Installation (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project

## Usage

1. Click the Focus Guard extension icon in your browser toolbar
2. Sign in with your Focus Guard account
3. Your blocked websites will automatically be synced
4. Start a focus session from the popup or web app
5. Try to visit a blocked site - you'll see the blocked page!

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker for blocking logic
- `content.js` - Content script that runs on every page
- `blocked.html` - Page shown when a site is blocked
- `popup/` - Extension popup UI
  - `popup.html` - Popup structure
  - `popup.css` - Popup styles
  - `popup.js` - Popup logic

## Development

The extension connects to the backend API at `http://localhost:5000`. Update the `API_BASE_URL` in `background.js` for production.

## Icons

Place your extension icons in the `icons/` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)
