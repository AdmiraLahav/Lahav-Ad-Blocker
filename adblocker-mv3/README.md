
# Minimal Ad Blocker (MV3)

A no-nonsense Chrome Manifest V3 ad blocker that uses the **declarativeNetRequest (DNR)** API for network request blocking and a **content script** for cosmetic filtering.

## Install (Windows or Ubuntu)

1. Download and unzip this project (or use the ZIP linked in ChatGPT).
2. Open Chrome (or Chromium-based browser).
3. Go to `chrome://extensions`.
4. Enable **Developer mode** (top-right).
5. Click **Load unpacked** and select the unzipped `adblocker-mv3` folder.

## Use

- Click the extension icon → toggle **Enabled** to turn cosmetic filtering on/off.
- "Network ruleset" shows whether the built-in static rules are ON/OFF; use **Toggle ruleset** to enable/disable.
- Open **Options** to:
  - Add custom URL patterns (e.g., `*://*.example.com/*`) to hard-block requests via DNR.
  - Add CSS selectors (one per line) to hide page elements ("cosmetic filtering").

### Notes

- Static rules live in `rules_1.json` and can be toggled. 
- Custom dynamic rules are stored in Chrome and survive restarts. 
- Cosmetic filters are CSS: safe and fast, but they don't stop network requests — DNR does.

## File Map

- `manifest.json` — MV3 manifest
- `rules_1.json` — starter network-block rules
- `content.js` — cosmetic filtering (CSS injection based on stored selectors)
- `popup.html` / `popup.js` — on/off and ruleset toggle
- `options.html` / `options.js` — custom block patterns + selector management
