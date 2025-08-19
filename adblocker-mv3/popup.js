
const ENABLED_KEY = "enabled";
const RULESET_ID = "base_rules";

const $ = (sel) => document.querySelector(sel);

function setRulesetBadge(enabledIds) {
  const badge = $("#rulesetState");
  const on = enabledIds.includes(RULESET_ID);
  badge.textContent = on ? "ON" : "OFF";
  badge.style.background = on ? "#e6f4ea" : "#fdecea";
  badge.style.color = on ? "#137333" : "#a50e0e";
}

async function refreshUI() {
  // Enabled checkbox
  chrome.storage.sync.get({ [ENABLED_KEY]: true }, (cfg) => {
    $("#enabled").checked = !!cfg[ENABLED_KEY];
  });

  // Ruleset state & dynamic rule count
  chrome.declarativeNetRequest.getEnabledRulesets((ids) => setRulesetBadge(ids));
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    $("#dynCount").textContent = rules.length.toString();
  });
}

document.addEventListener("DOMContentLoaded", refreshUI);

$("#enabled").addEventListener("change", (e) => {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ [ENABLED_KEY]: enabled });
});

$("#toggleRuleset").addEventListener("click", async () => {
  chrome.declarativeNetRequest.getEnabledRulesets(async (ids) => {
    const on = ids.includes(RULESET_ID);
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: on ? [] : [RULESET_ID],
      disableRulesetIds: on ? [RULESET_ID] : []
    });
    refreshUI();
  });
});
