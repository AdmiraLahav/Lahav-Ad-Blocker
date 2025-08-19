
const NEXT_ID_KEY = "nextDynamicRuleId";
const DEFAULT_NEXT_ID = 10000;

// Render existing dynamic rules
async function refreshPatterns() {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const wrap = document.getElementById("patternsList");
    if (!rules.length) {
      wrap.innerHTML = "<div class='muted'>No custom block rules yet.</div>";
      return;
    }
    const rows = rules.map(r => {
      const patt = r.condition && r.condition.urlFilter ? r.condition.urlFilter : "(unknown)";
      return `<div class="row">
        <div class="tag" style="flex:1">${patt}</div>
        <button class="danger" data-id="${r.id}">Remove</button>
      </div>`;
    }).join("");
    wrap.innerHTML = rows;

    wrap.querySelectorAll("button.danger").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = Number(e.currentTarget.getAttribute("data-id"));
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
        refreshPatterns();
      });
    });
  });
}

async function ensureNextId(callback) {
  chrome.storage.sync.get({ [NEXT_ID_KEY]: DEFAULT_NEXT_ID }, (cfg) => {
    let nextId = cfg[NEXT_ID_KEY] || DEFAULT_NEXT_ID;
    callback(nextId);
  });
}

document.getElementById("addPattern").addEventListener("click", async () => {
  const input = document.getElementById("patternInput");
  const pattern = (input.value || "").trim();
  if (!pattern) return;

  ensureNextId(async (nextId) => {
    const rule = {
      id: nextId,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: pattern,
        resourceTypes: [
          "main_frame","sub_frame","stylesheet","script","image",
          "font","media","xmlhttprequest","websocket","other"
        ]
      }
    };
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: [rule] });
    chrome.storage.sync.set({ [NEXT_ID_KEY]: nextId + 1 });
    document.getElementById("patternInput").value = "";
    refreshPatterns();
  });
});

// Load & save custom selectors
function loadSelectors() {
  chrome.storage.sync.get({ customSelectors: [] }, (cfg) => {
    const arr = Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [];
    document.getElementById("selectors").value = arr.join("\n");
  });
}
document.getElementById("saveSelectors").addEventListener("click", () => {
  const text = document.getElementById("selectors").value || "";
  const arr = text.split("\n").map(s => s.trim()).filter(Boolean);
  chrome.storage.sync.set({ customSelectors: arr }, () => {
    const el = document.getElementById("saveStatus");
    el.textContent = "Saved";
    setTimeout(() => el.textContent = "", 1200);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  refreshPatterns();
  loadSelectors();
});
