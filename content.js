(function() {
  console.log('shy: loaded on', window.location.href);

  const defaults = { enabled: true, intensity: 8, shortcut: 'Alt+S', hoverReveal: true };
  let settings = defaults;

  const SIDEBAR_SELECTORS = [
    'div.flex-shrink-0.overflow-x-hidden.bg-token-sidebar-surface-primary',
    'div[class*="flex-shrink-0"][class*="overflow-x-hidden"]',
    'div[class*="bg-token-sidebar"]',
    'nav[class*="flex"][class*="h-full"]',
    'nav',
    'aside',
    '#sidebar',
    '[role="navigation"]'
  ];

  function findSidebar() {
    for (const sel of SIDEBAR_SELECTORS) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          console.log('shy: found sidebar via', sel);
          return el;
        }
      } catch (e) {}
    }

    const allNavs = document.querySelectorAll('nav');
    for (const nav of allNavs) {
      if (nav.offsetWidth < 400 && nav.offsetHeight > 200) {
        console.log('shy: found sidebar via nav heuristic');
        return nav;
      }
    }

    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      const cn = typeof div.className === 'string' ? div.className : '';
      if (cn.includes('flex-shrink-0') && cn.includes('overflow-x-hidden')) {
        console.log('shy: found sidebar via class search');
        return div;
      }
    }

    console.log('shy: no sidebar found');
    return null;
  }

  function applyBlur() {
    const sidebar = findSidebar();
    if (!sidebar) return;
    sidebar.classList.add('shy-blur');
    sidebar.dataset.shyActive = 'true';
    sidebar.style.setProperty('--shy-blur-intensity', settings.intensity + 'px');
    sidebar.dataset.shyHoverReveal = settings.hoverReveal ? 'true' : 'false';
    console.log('shy: blur applied');
  }

  function removeBlur() {
    document.querySelectorAll('[data-shy-active="true"]').forEach(el => {
      el.classList.remove('shy-blur');
      el.removeAttribute('data-shy-active');
    });
    console.log('shy: blur removed');
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
    console.log('shy: init, enabled by default');
    chrome.storage.sync.get(['shySettings'], (result) => {
      settings = result.shySettings || defaults;
      console.log('shy: settings loaded', settings);
      if (settings.enabled) {
        if (!tryInit()) {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (tryInit() || attempts > 20) {
              clearInterval(interval);
              console.log('shy: poll finished, attempts:', attempts);
            }
          }, 500);
        }
        startObserver();
      }
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    console.log('shy: message received', message);
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