document.addEventListener('DOMContentLoaded', () => {
  const enableBlur = document.getElementById('enableBlur');
  const blurIntensity = document.getElementById('blurIntensity');
  const hoverReveal = document.getElementById('hoverReveal');
  const status = document.getElementById('status');
  const shortcutLink = document.getElementById('shortcutLink');

  const defaults = {
    enabled: true,
    intensity: 8,
    hoverReveal: true
  };

  chrome.storage.sync.get(['shySettings'], (result) => {
    const settings = result.shySettings || defaults;
    enableBlur.checked = settings.enabled;
    blurIntensity.value = settings.intensity;
    hoverReveal.checked = settings.hoverReveal;
    updateStatus(settings.enabled);
  });

  function saveSettings() {
    const settings = {
      enabled: enableBlur.checked,
      intensity: parseInt(blurIntensity.value),
      hoverReveal: hoverReveal.checked
    };
    chrome.storage.sync.set({ shySettings: settings });
    updateStatus(settings.enabled);
    chrome.tabs.query({ url: ['*://chat.openai.com/*', '*://chatgpt.com/*', '*://gemini.google.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings });
      });
    });
  }

  function updateStatus(enabled) {
    status.textContent = enabled ? 'Active on ChatGPT & Gemini' : 'Disabled';
    status.className = enabled ? 'status active' : 'status';
  }

  enableBlur.addEventListener('change', saveSettings);
  blurIntensity.addEventListener('input', saveSettings);
  hoverReveal.addEventListener('change', saveSettings);

  shortcutLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});