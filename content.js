(function() {
  const defaults = { enabled: true, intensity: 8, hoverReveal: true };
  let settings = defaults;
  let observer = null;

  function findSidebar() {
    const candidates = document.querySelectorAll('nav, aside, [role="navigation"]');
    for (const el of candidates) {
      if (el.querySelector('a[href*="/c/"]') || el.querySelector('a[href*="/app/"]') || el.querySelector('[draggable="true"]')) {
        return el;
      }
    }

    const chatLinks = document.querySelectorAll('a[href*="/c/"], a[href*="/app/"]');
    if (chatLinks.length > 0) {
      let parent = chatLinks[0];
      for (let i = 0; i < 5; i++) {
        if (parent?.parentElement) parent = parent.parentElement;
      }
      return parent;
    }

    const allNavs = document.querySelectorAll('nav');
    for (const nav of allNavs) {
      const text = nav.textContent || '';
      if (text.includes('New chat') || text.includes('Chat history')) {
        return nav;
      }
    }

    const sideNav = document.querySelector('side-navigation-content');
    if (sideNav) return sideNav;

    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      const cn = typeof div.className === 'string' ? div.className : '';
      if (cn.includes('flex-shrink-0') && cn.includes('overflow-x-hidden')) {
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

  function startObserver() {
    observer = new MutationObserver(() => {
      if (!document.querySelector('[data-shy-active="true"]') && findSidebar()) {
        applyBlur();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    startObserver();

    if (findSidebar()) {
      applyBlur();
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (!document.querySelector('[data-shy-active="true"]') && findSidebar()) {
        applyBlur();
      }
      if (document.querySelector('[data-shy-active="true"]') || attempts > 30) {
        clearInterval(interval);
      }
    }, 100);

    chrome.storage.sync.get(['shySettings'], (result) => {
      settings = result.shySettings || defaults;
      if (!settings.enabled) removeBlur();
      else if (!document.querySelector('[data-shy-active="true"]')) applyBlur();
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