(function() {
  const defaults = { enabled: true, intensity: 8, shortcut: 'Alt+S', hoverReveal: true };
  let settings = defaults;

  const SIDEBAR_SELECTORS = [
    'div.flex-shrink-0.overflow-x-hidden.bg-token-sidebar-surface-primary',
    'div.flex-shrink-0.overflow-x-hidden',
    'nav',
    'aside'
  ];

  function findSidebar() {
    for (const sel of SIDEBAR_SELECTORS) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {}
    }
    const all = document.querySelectorAll('div');
    for (const div of all) {
      const cn = div.className;
      if (typeof cn === 'string' && cn.includes('flex-shrink-0') && cn.includes('overflow-x-hidden')) {
        return div;
      }
    }
    return null;
  }

  function applyBlur() {
    const sidebar = findSidebar();
    if (!sidebar) return;
    sidebar.classList.add('shy-blur');
    sidebar.dataset.shyActive = 'true';
    sidebar.style.setProperty('--shy-blur-intensity', settings.intensity + 'px');
    sidebar.dataset.shyHoverReveal = settings.hoverReveal ? 'true' : 'false';
  }

  function removeBlur() {
    document.querySelectorAll('[data-shy-active="true"]').forEach(el => {
      el.classList.remove('shy-blur');
      el.removeAttribute('data-shy-active');
    });
  }

  function tryInit() {
    if (findSidebar()) {
      applyBlur();
      return true;
    }
    return false;
  }

  function startObserver() {
    const target = document.body || document.documentElement;
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-shy-active="true"]') && findSidebar()) {
        applyBlur();
      }
    });
    observer.observe(target, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 30000);
  }

  function init() {
    chrome.storage.sync.get(['shySettings'], (result) => {
      settings = result.shySettings || defaults;
      if (settings.enabled) {
        if (!tryInit()) {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (tryInit() || attempts > 20) clearInterval(interval);
          }, 500);
        }
        startObserver();
      }
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateSettings') {
      settings = { ...settings, ...message.settings };
      if (settings.enabled) applyBlur();
      else removeBlur();
    } else if (message.action === 'toggle') {
      settings.enabled = !settings.enabled;
      if (settings.enabled) applyBlur();
      else removeBlur();
    }
  });

  init();
})();