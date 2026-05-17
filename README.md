<p align="center">
  <img src="logo.png" alt="shy logo" width="500">
</p>

<h1 align="center">shy — ChatGPT Privacy Extension</h1>

<p align="center">
  <b>Blur the ChatGPT sidebar to keep your conversation history private.</b><br>
  A lightweight Chrome extension for privacy-conscious ChatGPT users.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
</p>

## Why shy?

ChatGPT displays your full conversation history in the sidebar — visible to anyone walking by your screen. **shy** blurs the sidebar content so you can use ChatGPT in public, shared, or open spaces without exposing your private chats.

## Features

- **Blur ChatGPT sidebar** — Obscures chat history listings for instant privacy
- **Configurable blur intensity** — Adjust from subtle (2px) to maximum (20px) blur
- **Hover to reveal** — Mouse over the sidebar to temporarily view content
- **Keyboard shortcut** — Press `Alt+S` to toggle blur on and off
- **Toggle on/off** — Enable or disable via the popup menu

## Installation

```bash
git clone https://github.com/essopsp/shy-extension.git
```

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked** and select the cloned `shy-extension` folder
4. The extension activates automatically on ChatGPT

## Usage

| Action | Method |
|--------|--------|
| Toggle blur | Click the extension icon or press `Alt+S` |
| Adjust intensity | Open the popup and drag the intensity slider |
| Reveal content | Hover your mouse over the blurred sidebar |
| Configure settings | Click the extension icon in the toolbar |

## How it works

shy injects a CSS blur filter over the ChatGPT sidebar `<nav>` element. A `MutationObserver` ensures the blur reapplies even as ChatGPT dynamically re-renders. Settings are synced via `chrome.storage.sync` across all Chrome profiles.

## Permissions

- `storage` — Saves your blur settings across sessions
- `activeTab` — Detects and interacts with ChatGPT tabs
- Host access to `chat.openai.com` and `chatgpt.com` — Runs only on ChatGPT domains

## License

MIT
