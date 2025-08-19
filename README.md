# Minimal Ad Blocker (MV3) + YouTube Helper

A lightweight Chrome **Manifest V3** extension that blocks common ad networks, hides cosmetic ad elements, and includes a YouTube helper that **auto-skips, mutes, and accelerates through YouTube ads**.

---

## ✨ Features
- **Network blocking**: Uses Chrome’s `declarativeNetRequest` API to block requests to known ad networks (DoubleClick, Criteo, Taboola, etc.).
- **Cosmetic filtering**: Injects CSS to hide ad banners, containers, and sponsored elements across sites.
- **YouTube helper**:
  - Skips pre-roll ads automatically.
  - Detects mid-roll ads → mutes + speeds through them at 16× until they’re gone.
  - Hides banner and companion ads instantly.
- **Custom rules**:
  - Add your own block patterns (wildcards) via the Options page.
  - Add custom CSS selectors to nuke site-specific ad slots.
- **Sync support**: All settings (enabled state, custom rules, selectors) sync via your Google account across devices.

---

## 📦 Installation
1. Download this repository as a ZIP and unzip it (or clone via `git clone`).
2. Open Chrome (or any Chromium-based browser like Brave/Edge).
3. Go to `chrome://extensions`.
4. Enable **Developer mode** (toggle in the top-right).
5. Click **Load unpacked** and select the unzipped project folder.

That’s it — the extension icon will appear in your toolbar.

---

## 🛠 Usage
- **Toolbar popup**:
  - Toggle cosmetic filtering on/off.
  - See if the static network ruleset is enabled.
  - Check how many custom dynamic rules you’ve added.
- **Options page**:
  - Add/remove custom URL block rules (`*://*.example.com/*`).
  - Save CSS selectors to hide custom ad elements.
- Works immediately on most ad-heavy sites and YouTube.

---

## ⚠️ Notes & Limitations
- YouTube ads are **not truly blocked at the network layer** (Google streams them alongside video). Instead, they are:
  - Skipped if possible,
  - Muted + sped up if mid-roll,
  - Hidden visually if companions/overlays.
- This extension ships with a small starter ruleset — it’s intentionally lightweight. For full-scale coverage like uBlock, import more rules manually.
- Developer-mode extensions don’t auto-sync; you need to install it manually on each PC. Settings sync once installed.

---

## 📂 Project Structure
- `manifest.json` — MV3 configuration
- `rules_1.json` — starter block rules
- `content.js` — cosmetic filters + YouTube helper logic
- `popup.html` / `popup.js` — popup UI
- `options.html` / `options.js` — options page
- `README.md` — this file

---

## 🚀 Roadmap / Ideas
- [ ] Add an “ads skipped” counter in the popup
- [ ] One-click whitelist for specific sites
- [ ] GitHub Action to auto-build and publish release ZIPs
- [ ] Support for importing filter lists (ABP, EasyList, etc.)

---

## 📜 License
MIT License — feel free to use, modify, and share.
