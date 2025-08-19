// Minimal cosmetic filtering + YouTube ad skipper/accelerator
(function () {
  // ---- Global toggle & cosmetic selectors (still used everywhere) ----
  const DEFAULT_SELECTORS = [
    "#ad", ".ad", ".ads", ".advert", ".advertisement",
    "[id*='ad-container' i]", "[class*='ad-container' i]",
    "[id^='google_ads_']", "iframe[src*='doubleclick']",
    "iframe[src*='googlesyndication']",
    // YouTube common ad shells (cosmetic)
    "ytd-promoted-sparkles-web-renderer",
    "ytd-display-ad-renderer",
    ".ytp-ad-module",
    "div[id^='ad-slot-']",
    "div[class*='sponsored' i]",
    "[data-ad], [data-ad-client], [data-ad-slot]"
  ];

  const state = { enabled: true, customSelectors: [] };

  function buildCss(selectors) {
    if (!selectors?.length) return "";
    return selectors.map(s => `${s} { display: none !important; }`).join("\n");
  }

  function applyStyles() {
    if (!state.enabled) return;
    const styleId = "__mv3_adblock_css__";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.type = "text/css";
      document.documentElement.appendChild(style);
    }
    const allSelectors = Array.from(new Set([...DEFAULT_SELECTORS, ...state.customSelectors]));
    style.textContent = buildCss(allSelectors);
  }

  chrome.storage.sync.get({ enabled: true, customSelectors: [] }, (cfg) => {
    state.enabled = !!cfg.enabled;
    state.customSelectors = Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [];
    applyStyles();
    if (state.enabled) maybeInitYouTubeHelper();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) state.enabled = !!changes.enabled.newValue;
    if (changes.customSelectors) state.customSelectors = changes.customSelectors.newValue || [];
    if (!state.enabled) {
      const style = document.getElementById("__mv3_adblock_css__");
      if (style) style.textContent = "";
    } else {
      applyStyles();
      maybeInitYouTubeHelper();
    }
  });

  // -------------------- YouTube helper (auto-skip/accelerate) --------------------
  function maybeInitYouTubeHelper() {
    if (!state.enabled) return;
    if (!/(^|\.)youtube\.com$/.test(location.hostname)) return;

    const YT_COSMETIC_REMOVE = [
      "ytd-ad-slot-renderer",
      "ytd-companion-slot-renderer",
      ".ytp-ad-player-overlay",
      ".ytd-display-ad-renderer",
      "#player-ads",
      "#masthead-ad",
      ".ytd-action-companion-ad-renderer"
    ];

    let adInterval = null;
    const saved = { rate: null, muted: null };

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const getVideo = () => document.querySelector("video.html5-main-video");
    const isAdShowing = () => document.querySelector("#movie_player.ad-showing") != null;

    function zapCompanions() {
      YT_COSMETIC_REMOVE.forEach(sel => $$(sel).forEach(n => n.remove()));
      // also close overlay ads if they appear
      $$(".ytp-ad-overlay-close-button").forEach(b => b.click());
    }

    function clickSkip() {
      const btn = $(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
      if (btn) btn.click();
    }

    function onAdStart() {
      const v = getVideo();
      if (!v) return;

      if (saved.rate === null) saved.rate = v.playbackRate || 1;
      if (saved.muted === null) saved.muted = v.muted;

      // mute + accelerate during ad
      try { v.muted = true; } catch {}
      try { v.playbackRate = 16; } catch {}

      clickSkip();
      zapCompanions();

      if (!adInterval) {
        adInterval = setInterval(() => {
          // If ad ended, restore and stop
          if (!isAdShowing()) return onAdEnd();

          clickSkip();
          zapCompanions();

          // Try to jump to end for short ads (pre-rolls often < 120s)
          try {
            const d = v.duration || 0;
            if (d && d < 120 && v.currentTime < d - 0.2) {
              v.currentTime = Math.max(d - 0.1, 0);
            }
          } catch {}
        }, 300);
      }
    }

    function onAdEnd() {
      if (adInterval) { clearInterval(adInterval); adInterval = null; }
      const v = getVideo();
      if (v) {
        try { v.playbackRate = saved.rate ?? 1; } catch {}
        if (saved.muted !== null) try { v.muted = saved.muted; } catch {}
      }
      zapCompanions();
    }

    // Watch player state changes (class "ad-showing" toggles on #movie_player)
    function hookPlayer() {
      const mp = document.getElementById("movie_player");
      if (!mp) return setTimeout(hookPlayer, 500);
      const obs = new MutationObserver(() => {
        if (isAdShowing()) onAdStart(); else onAdEnd();
      });
      obs.observe(mp, { attributes: true, attributeFilter: ["class"] });
    }

    // YouTube is an SPA; re-hook on navigation
    window.addEventListener("yt-navigate-start", () => onAdEnd(), { passive: true });
    window.addEventListener("yt-navigate-finish", () => {
      zapCompanions();
      hookPlayer();
    }, { passive: true });

    // initial hook
    zapCompanions();
    hookPlayer();
  }
})();
