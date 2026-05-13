chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-shy') {
    chrome.tabs.query({ url: ['*://chat.openai.com/*', '*://chatgpt.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      });
    });
  }
});