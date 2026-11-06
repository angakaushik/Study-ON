// background.js - Service Worker for ClassWatch Chrome Extension
// Extracts ONLY hostname of active tab. Never sends full URLs, page content, or keystrokes.

let activeTabDomain = 'wikipedia.org';
let isAway = false;
let ws = null;
let heartbeatTimer = null;

function extractHostname(url) {
  if (!url) return 'Away';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'about:' || parsed.protocol === 'chrome-extension:') {
      return 'newtab';
    }
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'Away';
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      activeTabDomain = extractHostname(tab.url);
      reportDomain(activeTabDomain);
    }
  } catch {
    // Tab closed or unavailable
  }
});

// Track URL updates in active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    activeTabDomain = extractHostname(changeInfo.url);
    reportDomain(activeTabDomain);
  }
});

// Track window focus (reports "Away" when student switches away from browser)
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isAway = true;
    reportDomain('Away');
  } else {
    isAway = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        activeTabDomain = extractHostname(tabs[0].url);
        reportDomain(activeTabDomain);
      }
    });
  }
});

function reportDomain(domain) {
  chrome.storage.local.get(['isConnected', 'serverUrl', 'studentId', 'classCode'], (data) => {
    if (!data.isConnected) return;

    chrome.storage.local.set({ currentDomain: domain });

    // Send HTTP/WS telemetry to ClassWatch backend
    if (data.serverUrl && data.studentId && data.classCode) {
      fetch(`${data.serverUrl}/api/classwatch/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: data.studentId,
          classCode: data.classCode,
          domain: domain,
          timestamp: Date.now()
        })
      }).then(res => res.json()).then(resp => {
        if (resp && resp.locked) {
          showLockScreen();
        }
        if (resp && resp.warning) {
          showWarningNotification(resp.warning);
        }
      }).catch(() => {
        // Retry silently on temporary connection failure
      });
    }
  });
}

function showWarningNotification(warningText) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'ClassWatch Teacher Warning',
      message: warningText || 'Please return to your assigned academic tasks.',
      priority: 2
    });
  }
}

function showLockScreen() {
  chrome.tabs.create({ url: chrome.runtime.getURL('lock.html') });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'START_MONITORING') {
    reportDomain(activeTabDomain);
  }
});
