(function() {
  const defaults = { enabled: true, intensity: 8, hoverReveal: true };
  let settings = defaults;

  function findSidebar() {
    const candidates = document.querySelectorAll('nav, aside, [role="navigation"]');
    for (const el of candidates) {
      if (el.querySelector('a[href*="/c/"]') || el.querySelector('[draggable="true"]')) {
        return el;
      }
    }

    const convLinks = document.querySelectorAll('a[href*="/c/"]');
    if (convLinks.length > 0) {
      let parent = convLinks[0];
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

  function tryInit() {
    if (findSidebar()) {
      applyBlur();
      return true;
    }
    return false;
  }

  function startObserver() {
    const target = document.body || document.documentElement;
    let observer = new MutationObserver(() => {
      if (!document.querySelector('[data-shy-active="true"]') && findSidebar()) {
        applyBlur();
        observer.disconnect();
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