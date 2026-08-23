# MaskAgent (SIH26171) 🛡️🤖
### On-device Visual Perception for Light-weight Browser Agents

**MaskAgent** is a privacy-preserving Manifest V3 browser extension built for **SIH26171**. It empowers autonomous web navigation using local vision-capable AI models running entirely on-device via **Ollama**.

---

## 🌟 Key Features

- 🔒 **100% On-Device & Private**: All image analysis and model inference run locally at `http://localhost:11434`. Zero data leaves your machine.
- 🛡️ **Dual-Layer Privacy Redaction**:
  - **DOM Masking**: Redacts passwords, email addresses, phone numbers, credit card patterns, SSNs, and OTP fields from text representations.
  - **Canvas Image Redaction**: Automatically draws solid opaque redaction boxes over sensitive UI bounding boxes on captured tab screenshots *before* sending them to the vision model.
- 🎯 **Visual Element Grounding**: Overlays temporary numerical element badges (`[1]`, `[2]`, `[3]`) on clickable DOM elements for precise vision reasoning.
- 🔄 **Automated Ollama Management**:
  - Automatically checks if Ollama is running on startup.
  - Detects if the vision model (e.g. `llava`) is missing and triggers a background download via Ollama's `/api/pull` API with live UI percentage progress.
  - Friendly popup alerts with one-click retry.
- 💻 **Cross-Platform**: Compatible with Chrome, Microsoft Edge, and Brave on **Windows, macOS, and Linux**.

---

## 📁 Extension Architecture

```
MaskAgent/
├── manifest.json       # Manifest V3 configuration & host permissions
├── background.js       # Service worker: Ollama API, Canvas redaction, vision loop
├── content.js          # DOM element parser, PII detection, action executor
├── popup.html          # Glassmorphism dark UI dashboard
├── popup.js            # UI controller, state sync & download progress
├── styles.css          # Modern dark design system
├── icon16.png          # Extension toolbar icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension store icon (128x128)
└── README.md           # Documentation & setup guide
```

---

## 🚀 How to Load & Use MaskAgent

### Step 1: Ensure Ollama is Installed & Running
1. Download Ollama from [https://ollama.com](https://ollama.com).
2. Start Ollama on your machine (it runs locally at `http://localhost:11434`).
3. *(Optional)* Pull your preferred model manually, or let MaskAgent pull `deepseek-coder` automatically for you:
   ```bash
   ollama pull deepseek-coder
   ```

### Step 2: Load Unpacked Extension in Chrome / Edge / Brave
1. Open your Chromium browser and navigate to:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `MaskAgent` directory (`/home/bhuvanesh-m/Downloads/MaskAgent`).
5. The **MaskAgent** icon will appear in your extensions toolbar!

---

## 🎮 Operating the Agent

1. **Open Popup**: Click the MaskAgent icon in your browser toolbar.
2. **Check Connection**:
   - If Ollama is running and `deepseek-coder` is available, you will see a green **Ready** status badge.
   - If model is missing, MaskAgent will show **Downloading Model...** with a progress bar until completion.
3. **Select Model**: Choose between `deepseek-coder` (default), `deepseek-coder:6.7b`, `llava`, or `qwen2.5-vl`.
4. **Configure Privacy**: Ensure **Visual & DOM Redaction** is toggled ON to active PII masking.
5. **Set Goal & Run**:
   - Type a task, e.g.: `"Search for open source vision models and click the top result"`.
   - Click **Run Vision Agent**.
   - Watch real-time actions executed directly on your active browser tab with step logs in the popup!

---

## 🛡️ Privacy & Security Guarantee

- **No Remote Servers**: Ollama endpoint is strictly locked to `http://localhost:11434`.
- **Canvas PII Erasure**: Password fields (`type="password"`), sensitive inputs, email addresses, and phone numbers are blacked out on the HTML5 `OffscreenCanvas` before base64 encoding.
- **JSON Action Enforcement**: System prompt mandates strict JSON outputs (`click`, `type`, `scroll`, `finish`), preventing prompt injection or arbitrary code execution.

---

## 🔧 Troubleshooting

- **"Ollama Missing" Popup**: Ensure Ollama is started (`ollama serve` or desktop app running) and accessible at `http://localhost:11434`. Click **Retry Connection**.
- **Model Pulling Slow**: Initial download depends on internet connection. Once downloaded, inference is 100% offline.
- **Switching Vision Models**: You can pull custom models via terminal (`ollama pull qwen2.5-vl`) and select them from the dropdown menu in MaskAgent popup.
