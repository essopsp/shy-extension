(function() {
  const defaults = { enabled: true, intensity: 8, shortcut: 'Alt+S', hoverReveal: true };
  let settings = defaults;

  function applyBlur() {
    let sidebar = document.querySelector('nav');
    if (!sidebar) {
      const navCandidates = document.querySelectorAll('nav');
      for (const nav of navCandidates) {
        if (nav.textContent.includes('New chat') || nav.querySelector('[draggable="true"]')) {
          sidebar = nav;
          break;
        }
      }
    }

    if (!sidebar) return;

    sidebar.classList.add('shy-blur');
    sidebar.dataset.shyActive = 'true';
    sidebar.style.setProperty('--shy-blur-intensity', settings.intensity + 'px');
    sidebar.dataset.shyHoverReveal = settings.hoverReveal;
  }

  function removeBlur() {
    document.querySelectorAll('[data-shy-active="true"]').forEach(el => {
      el.classList.remove('shy-blur');
      el.removeAttribute('data-shy-active');
    });
  }

  function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    if (settings.enabled) {
      applyBlur();
    } else {
      removeBlur();
    }
  }

  function init() {
    chrome.storage.sync.get(['shySettings'], (result) => {
      settings = result.shySettings || defaults;
      if (settings.enabled) {
        const checkSidebar = setInterval(() => {
          if (document.querySelector('nav') || document.querySelector('[draggable="true"]')) {
            applyBlur();
            clearInterval(checkSidebar);
          }
        }, 500);
        setTimeout(() => clearInterval(checkSidebar), 10000);
      }
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateSettings') {
      updateSettings(message.settings);
    } else if (message.action === 'toggle') {
      settings.enabled = !settings.enabled;
      if (settings.enabled) {
        applyBlur();
      } else {
        removeBlur();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 's' && e.altKey) {
      e.preventDefault();
      settings.enabled = !settings.enabled;
      if (settings.enabled) {
        applyBlur();
      } else {
        removeBlur();
      }
    }
  });

  init();
})();