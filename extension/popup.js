// popup.js - Handles student authentication and connection to classroom monitor

document.addEventListener('DOMContentLoaded', async () => {
  const serverUrlInput = document.getElementById('serverUrl');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');
  const classCodeInput = document.getElementById('classCode');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const loginSection = document.getElementById('loginSection');
  const activeSection = document.getElementById('activeSection');
  const connStatus = document.getElementById('connStatus');

  // Load saved state
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['serverUrl', 'studentId', 'classCode', 'isConnected', 'studentName', 'currentDomain', 'status'], (data) => {
      if (data.serverUrl) serverUrlInput.value = data.serverUrl;
      if (data.studentId) studentIdInput.value = data.studentId;
      if (data.classCode) classCodeInput.value = data.classCode;

      if (data.isConnected) {
        showConnectedUI(data);
      }
    });
  }

  function showConnectedUI(data) {
    loginSection.style.display = 'none';
    activeSection.style.display = 'block';
    connStatus.textContent = 'Active';
    connStatus.style.background = '#1a3328';
    connStatus.style.color = '#5cc79a';

    document.getElementById('dispStudentName').textContent = data.studentName || data.studentId || 'Connected';
    document.getElementById('dispClassCode').textContent = data.classCode || '4892';
    document.getElementById('dispActiveDomain').textContent = data.currentDomain || 'wikipedia.org';
    document.getElementById('dispStatus').textContent = data.status || 'On task';
  }

  connectBtn.addEventListener('click', async () => {
    const serverUrl = serverUrlInput.value.trim() || 'http://localhost:3000';
    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value;
    const classCode = classCodeInput.value.trim();

    if (!studentId || !password) {
      alert('Please enter your Student ID and Password.');
      return;
    }
    if (!classCode || classCode.length !== 4) {
      alert('Please enter a valid 4-digit class code.');
      return;
    }

    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;

    // Save configuration and notify background service worker
    const config = {
      serverUrl,
      studentId,
      classCode,
      isConnected: true,
      studentName: studentId,
      currentDomain: 'wikipedia.org',
      status: 'On task'
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(config, () => {
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'START_MONITORING', config });
        }
        showConnectedUI(config);
      });
    } else {
      showConnectedUI(config);
    }
  });

  disconnectBtn.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ isConnected: false }, () => {
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'STOP_MONITORING' });
        }
        loginSection.style.display = 'block';
        activeSection.style.display = 'none';
        connStatus.textContent = 'Offline';
        connStatus.style.background = '#271616';
        connStatus.style.color = '#ef4444';
        connectBtn.textContent = 'Connect to Class';
        connectBtn.disabled = false;
      });
    }
  });
});
