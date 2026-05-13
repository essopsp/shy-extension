document.addEventListener('DOMContentLoaded', () => {
  const enableBlur = document.getElementById('enableBlur');
  const blurIntensity = document.getElementById('blurIntensity');
  const shortcut = document.getElementById('shortcut');
  const hoverReveal = document.getElementById('hoverReveal');
  const status = document.getElementById('status');

  const defaults = {
    enabled: true,
    intensity: 8,
    shortcut: 'Alt+S',
    hoverReveal: true
  };

  chrome.storage.sync.get(['shySettings'], (result) => {
    const settings = result.shySettings || defaults;
    enableBlur.checked = settings.enabled;
    blurIntensity.value = settings.intensity;
    shortcut.value = settings.shortcut;
    hoverReveal.checked = settings.hoverReveal;
    updateStatus(settings.enabled);
  });

  function saveSettings() {
    const settings = {
      enabled: enableBlur.checked,
      intensity: parseInt(blurIntensity.value),
      shortcut: shortcut.value,
      hoverReveal: hoverReveal.checked
    };
    chrome.storage.sync.set({ shySettings: settings });
    updateStatus(settings.enabled);
    chrome.tabs.query({ url: '*://chat.openai.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings });
      });
    });
  }

  function updateStatus(enabled) {
    status.textContent = enabled ? 'Active on ChatGPT' : 'Disabled';
    status.className = enabled ? 'status active' : 'status';
  }

  enableBlur.addEventListener('change', saveSettings);
  blurIntensity.addEventListener('input', saveSettings);
  hoverReveal.addEventListener('change', saveSettings);

  shortcut.addEventListener('click', () => {
    shortcut.value = 'Press keys...';
    shortcut.style.color = '#10a37f';

    const handleKey = (e) => {
      e.preventDefault();
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');

      const key = e.key.toUpperCase();
      if (key !== 'CONTROL' && key !== 'ALT' && key !== 'SHIFT' && key !== 'META') {
        parts.push(key);
      }

      if (parts.length > 0 && key !== 'CONTROL' && key !== 'ALT') {
        shortcut.value = parts.join('+');
        shortcut.style.color = '#fff';
        shortcut.blur();
        document.removeEventListener('keydown', handleKey);
        saveSettings();
      }
    };

    document.addEventListener('keydown', handleKey);
  });
});