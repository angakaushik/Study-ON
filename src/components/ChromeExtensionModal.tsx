import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileCode,
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Layers,
  Terminal,
} from 'lucide-react';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeFile, setActiveFile] = useState<'manifest' | 'background' | 'popupHtml' | 'popupJs' | 'lockHtml'>('manifest');
  const [copied, setCopied] = useState(false);

  const fileContents = {
    manifest: `{
  "manifest_version": 3,
  "name": "ClassWatch - Student Classroom Companion",
  "version": "1.0.0",
  "description": "Reports active tab hostname to teacher dashboard during classroom study sessions.",
  "permissions": [
    "tabs",
    "storage",
    "notifications"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "ClassWatch Status"
  },
  "background": {
    "service_worker": "background.js"
  }
}`,
    background: `// background.js - Service Worker for ClassWatch Chrome Extension
let activeTabDomain = 'wikipedia.org';

function extractHostname(url) {
  if (!url) return 'Away';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'about:') return 'newtab';
    return parsed.hostname.toLowerCase().replace(/^www\\./, '');
  } catch {
    return 'Away';
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab?.url) reportDomain(extractHostname(tab.url));
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    reportDomain('Away');
  }
});`,
    popupHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 320px; background: #0f1c18; color: #fff; padding: 16px; font-family: sans-serif; }
    input { width: 100%; padding: 8px; background: #16271f; border: 1px solid #2a473b; color: #fff; border-radius: 6px; margin-bottom: 8px; }
    button { width: 100%; padding: 10px; background: #5cc79a; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h3>🛡️ ClassWatch Companion</h3>
  <input id="studentId" placeholder="Student ID (e.g. STU-2026-4401)" />
  <input id="password" type="password" placeholder="Password" />
  <input id="classCode" placeholder="4-Digit Class Code (e.g. 4892)" />
  <button id="connectBtn">Connect to Classroom</button>
  <script src="popup.js"></script>
</body>
</html>`,
    popupJs: `document.getElementById('connectBtn').addEventListener('click', () => {
  const studentId = document.getElementById('studentId').value;
  const classCode = document.getElementById('classCode').value;
  chrome.storage.local.set({ studentId, classCode, isConnected: true }, () => {
    alert('Connected to classroom ' + classCode);
  });
});`,
    lockHtml: `<!DOCTYPE html>
<html>
<body style="background:#0f1c18;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;font-family:sans-serif;">
  <div style="background:#16271f;padding:40px;border-radius:16px;border:1px solid #335645;">
    <div style="font-size:40px;margin-bottom:12px;">🔒</div>
    <h2>Classroom Screen Locked</h2>
    <p style="color:#94a3b8;">Your instructor has paused your screen. Please direct your attention to the classroom board.</p>
  </div>
</body>
</html>`,
  };

  const copyCurrentFile = () => {
    navigator.clipboard.writeText(fileContents[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#16271f] border border-[#233a30] rounded-3xl max-w-3xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#233a30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ClassWatch Chrome Extension (Manifest V3)</h3>
              <p className="text-xs text-[#94a3b8]">Ready-to-deploy files located in the project's <code>/extension</code> folder</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#1f3d30] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="bg-[#0f1c18] px-6 py-4 border-b border-[#233a30]">
          <div className="flex items-start gap-3">
            <Terminal className="w-4 h-4 text-[#5cc79a] shrink-0 mt-0.5" />
            <div className="text-xs text-[#94a3b8] leading-relaxed">
              <strong className="text-white">To load into Google Chrome or Edge:</strong>
              <ol className="list-decimal list-inside space-y-0.5 mt-1 text-[11px]">
                <li>Open <code>chrome://extensions</code> in your browser.</li>
                <li>Enable <strong className="text-[#5cc79a]">Developer mode</strong> (toggle in top right).</li>
                <li>Click <strong className="text-white">Load unpacked</strong> and select the <code>/extension</code> directory.</li>
                <li>Open the popup, enter your student ID and 4-digit class code to sync.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* File Tabs & Code Preview */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {(['manifest', 'background', 'popupHtml', 'popupJs', 'lockHtml'] as const).map((fileKey) => (
                <button
                  key={fileKey}
                  onClick={() => setActiveFile(fileKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    activeFile === fileKey
                      ? 'bg-[#5cc79a] text-[#0f1c18]'
                      : 'bg-[#0f1c18] border border-[#233a30] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {fileKey === 'manifest' ? 'manifest.json' : fileKey === 'popupHtml' ? 'popup.html' : fileKey === 'popupJs' ? 'popup.js' : fileKey === 'lockHtml' ? 'lock.html' : 'background.js'}
                </button>
              ))}
            </div>

            <button
              onClick={copyCurrentFile}
              className="px-3 py-1.5 bg-[#1f3d30] hover:bg-[#284f3e] border border-[#3b6754] text-[#5cc79a] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-[#0f1c18] border border-[#233a30] rounded-xl p-4 overflow-auto">
            <pre className="text-xs font-mono text-[#a7f3d0] leading-relaxed whitespace-pre">
              {fileContents[activeFile]}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f1c18] border-t border-[#233a30] flex items-center justify-between text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5cc79a]" />
            Privacy Certified: Submits hostnames only.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1f3d30] hover:bg-[#284f3e] text-white font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
