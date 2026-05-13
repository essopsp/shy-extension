(function() {
  const defaults = { enabled: true, intensity: 8, shortcut: 'Alt+S', hoverReveal: true };
  let settings = defaults;

  const SIDEBAR_SELECTORS = [
    'nav',
    'aside',
    '[data-testid="sidebar"]',
    '#sidebar',
    '.sidebar',
    '[class*="sidebar"]',
    '[class*="w-\\["]'
  ];

  function findSidebar() {
    const allNavs = document.querySelectorAll('nav, aside');
    for (const el of allNavs) {
      const text = el.textContent || '';
      const hasNewChat = text.includes('New chat') || text.includes('New');
      const hasHistory = el.querySelector('[draggable="true"]') || el.querySelector('a[href*="/c/"]');
      const hasWidth = el.className.includes('w-') || el.className.includes('width');
      if ((hasNewChat || hasHistory) && hasWidth) {
        return el;
      }
    }

    for (const selector of SIDEBAR_SELECTORS) {
      try {
        const el = document.querySelector(selector);
        if (el && (el.textContent?.includes('New chat') || el.querySelector('[draggable="true"]'))) {
          return el;
        }
      } catch (e) {}
    }

    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      const style = div.getAttribute('style') || '';
      if (style.includes('260px') || style.includes('280px') || style.includes('width: 260')) {
        return div;
      }
    }

    return null;
  }

  function applyBlur() {
    const sidebar = findSidebar();
    if (!sidebar) {
      return;
    }

    sidebar.classList.add('shy-blur');
    sidebar.dataset.shyActive = 'true';
    sidebar.style.setProperty('--shy-blur-intensity', settings.intensity + 'px');
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
        const tryApply = () => {
          if (findSidebar()) {
            applyBlur();
            return true;
          }
          return false;
        };

        if (!tryApply()) {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (tryApply() || attempts > 20) {
              clearInterval(interval);
            }
          }, 500);
        }
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