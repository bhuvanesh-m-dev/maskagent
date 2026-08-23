# MaskAgent (SIH26171) 🛡️🤖
### On-Device AI Browser Agent for Privacy-Preserving Web Automation

> **See the page. Protect the data. Let AI act.**

MaskAgent is a privacy-focused Manifest V3 browser extension built for **SIH26171** that combines **on-device privacy protection**, **DOM/UI understanding**, and **local AI-powered browser automation**.

Instead of blindly sending a webpage containing personal information to an AI model, MaskAgent first identifies sensitive information such as names, email addresses, phone numbers, addresses, passwords, and other personally identifiable information (PII).

The sensitive content is then **masked/redacted before AI processing**.

MaskAgent can then use a local AI model through **Ollama** (`DeepSeek-Coder` by default) to understand the sanitized webpage and determine browser actions.

---

## ✨ Core Idea

Traditional AI browser agents can potentially expose sensitive information because the webpage context may be sent directly to an AI service.

MaskAgent follows a different approach:

```text
                    🌐 WEBPAGE
                        │
                        ▼
              ┌──────────────────┐
              │  DOM + UI Scan   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Privacy Detection│
              │   & Redaction    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Sanitized Context│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Local AI / Ollama│
              │  DeepSeek-Coder  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Action Decision  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Browser Action   │
              │ Click / Type /   │
              │ Scroll / Select  │
              └──────────────────┘
```

The principle is simple:

> **Private information should be protected before AI processing, not after it.**

---

## 🔐 Why MaskAgent?

Modern browser agents can perform useful tasks such as:
- Finding buttons
- Reading webpage structure
- Filling forms
- Clicking elements
- Navigating websites
- Understanding webpage content

However, webpages frequently contain sensitive information.

For example:
```text
Name: John Alexander
Email: john.alexander@gmail.com
Phone: +91 9876543210
Password: ************
```

Sending this information directly to an AI system can create unnecessary privacy exposure.

MaskAgent attempts to solve this by introducing a privacy layer before AI reasoning.

```text
                WITHOUT MASKAGENT

Webpage → AI
           │
           └── Personal data may be exposed


                WITH MASKAGENT

Webpage
   ↓
Privacy Detection
   ↓
Redaction
   ↓
Sanitized Context
   ↓
Local AI
```

---

## 🚀 Features

### 🔒 Privacy-Preserving AI Processing
MaskAgent identifies potentially sensitive UI elements and masks them before AI processing.

Examples include:
- 👤 Names
- 📧 Email addresses
- 📱 Phone numbers
- 🔑 Passwords
- 🏠 Addresses
- 🎂 Dates of birth
- 🪪 Other personally identifiable information

### 🖥️ DOM + Visual Understanding
MaskAgent can work with webpage structure and visual context to understand the current page.

The extension can identify:
- Text fields
- Buttons
- Form elements
- Labels
- Links
- Page structure
- Visible UI elements

### 🧠 Local AI
MaskAgent communicates with a locally running AI model through Ollama.

**Default model:** `deepseek-coder` (also supports `deepseek-coder:6.7b`, `llava`, `qwen2.5-vl`).

The AI runs locally instead of requiring the webpage context to be sent to a remote AI API.

### 🤖 Browser Agent
The agent can reason about the next browser action.

Supported actions include:
- `CLICK`
- `TYPE`
- `SCROLL`
- `SELECT`
- `DONE` / `FINISH`

The agent follows the user's requested objective and attempts to perform the required action on the webpage.

### 📊 Agent Activity Stream
MaskAgent provides an activity stream showing what the agent is doing in real time.

Example:
```text
[5:31:44 PM] Starting MaskAgent task
[5:31:44 PM] Privacy Redaction: ON
[5:31:44 PM] Agent started
[5:31:44 PM] Executing Step 1/5
[5:31:45 PM] Privately masked sensitive UI elements
[5:31:45 PM] Consulting local Ollama model
[5:31:47 PM] Ollama response received
[5:31:47 PM] AI Decision: CLICK
```
This makes the agent's behavior easy to understand and debug.

---

## 🏗️ Project Architecture

```text
┌──────────────────────────────────────────┐
│                Browser                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │           MaskAgent                │  │
│  │                                    │  │
│  │  ┌──────────────┐                  │  │
│  │  │ Popup UI     │                  │  │
│  │  └──────┬───────┘                  │  │
│  │         │                          │  │
│  │  ┌──────▼───────┐                  │  │
│  │  │ Background   │                  │  │
│  │  │ Service      │                  │  │
│  │  └──────┬───────┘                  │  │
│  │         │                          │  │
│  │  ┌──────▼───────┐                  │  │
│  │  │ Content      │                  │  │
│  │  │ Script       │                  │  │
│  │  └──────┬───────┘                  │  │
│  │         │                          │  │
│  │         ▼                          │  │
│  │   DOM / UI Analysis                │  │
│  │         │                          │  │
│  │         ▼                          │  │
│  │   Privacy Redaction                │  │
│  └─────────┬──────────────────────────┘  │
│            │                             │
└────────────┼─────────────────────────────┘
             │
             │ Local API (http://localhost:11434)
             ▼
┌──────────────────────────────────────────┐
│                 Ollama                   │
│                                          │
│          DeepSeek-Coder                  │
│                                          │
│       Local AI Inference                 │
└──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
MaskAgent/
├── background.js     # Background service worker & Ollama AI API orchestration
├── content.js        # Webpage interaction, DOM processing & privacy PII detection
├── popup.html        # Extension dark glassmorphism interface
├── popup.js          # Popup controls, state sync & agent execution logic
├── styles.css        # Extension UI design system
├── manifest.json     # Manifest V3 extension configuration
├── icon16.png        # 16×16 extension toolbar icon
├── icon48.png        # 48×48 extension icon
├── icon128.png       # 128×128 extension icon
└── README.md         # Project documentation
```

### File Description

| File | Purpose |
| :--- | :--- |
| `manifest.json` | Chrome extension configuration (Manifest V3) |
| `background.js` | Background/service-worker logic and AI communication |
| `content.js` | Webpage interaction, DOM processing and privacy handling |
| `popup.html` | MaskAgent extension interface |
| `popup.js` | Popup controls and agent execution logic |
| `styles.css` | Extension UI styling |
| `icon16.png` | 16×16 extension icon |
| `icon48.png` | 48×48 extension icon |
| `icon128.png` | 128×128 extension icon |
| `README.md` | Project documentation |

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chrome Extension APIs (Manifest V3)
- **AI Engine**: Ollama, `deepseek-coder` (Local LLM inference)
- **Privacy Engine**: DOM-based PII detection, Canvas UI element masking/redaction, Password masking, Sanitized AI context
- **Browser Compatibility**: Chromium-based browsers (Google Chrome, Brave, Microsoft Edge)

---

## ⚙️ Requirements

Before running MaskAgent, make sure you have:
1. A Chromium-based browser (Chrome / Brave / Edge)
2. Operating System: Linux / Windows / macOS
3. Ollama installed & running at `http://localhost:11434`
4. Model installed: `deepseek-coder`
5. MaskAgent source code

```text
Browser → MaskAgent → Ollama → DeepSeek-Coder
```

---

## 🧠 Installing Ollama

Install Ollama on your system and verify it:
```bash
ollama --version
```

Check installed models:
```bash
ollama list
```

If `deepseek-coder` is not installed, pull it using Ollama:
```bash
ollama pull deepseek-coder
```

Then verify:
```bash
ollama list
```

---

## 🔌 Configure Ollama for the Browser Extension

Because MaskAgent is a browser extension communicating with a local Ollama server, the extension origin must be allowed.

On Linux systems where Ollama runs as a systemd service:
```bash
sudo systemctl edit ollama.service
```

Add:
```ini
[Service]
Environment="OLLAMA_ORIGINS=chrome-extension://*"
```

Save and exit. Then run:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

Verify the environment:
```bash
systemctl show ollama --property=Environment --no-pager
```
You should see: `OLLAMA_ORIGINS=chrome-extension://*`

---

## 🧪 Test Ollama Connection

First test the Ollama API:
```bash
curl http://localhost:11434/api/tags
```

Then test model inference:
```bash
curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder:latest",
    "prompt": "Say hello in one sentence.",
    "stream": false
  }'
```

---

## 🌐 Install MaskAgent in Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `MaskAgent` project folder.
5. MaskAgent will appear in your extension list!

---

## 🔄 After Changing the Code

Whenever you modify the extension source code:
```text
Extension Reload → Refresh Webpage → Open MaskAgent → Run Agent
```

---

## 🧪 Testing MaskAgent

### Example Test HTML Page
You can create a local test HTML file containing test data:

```html
<!DOCTYPE html>
<html>
<head>
    <title>MaskAgent Privacy Test</title>
</head>
<body>
    <h1>MaskAgent Privacy Test</h1>

    <label>Full Name</label>
    <input type="text" value="John Alexander">

    <br><br>

    <label>Email</label>
    <input type="email" value="john.alexander@example.com">

    <br><br>

    <label>Phone</label>
    <input type="tel" value="+91 9876543210">

    <br><br>

    <label>Password</label>
    <input type="password" value="TestPassword123">

    <br><br>

    <button>Submit</button>
</body>
</html>
```

### 🔐 Privacy Test Prompt
> "Scan this webpage for sensitive personal information such as names, email addresses, phone numbers, dates of birth, addresses, passwords, and other personally identifiable information. Verify that sensitive elements are masked before AI processing while non-sensitive information remains visible."

### 🎯 Browser Agent Test Prompts
- **Test 1 — Page Understanding**: *"Identify all form fields on this page. Do not change or submit anything."*
- **Test 2 — Element Detection**: *"Find the Submit button on this page. Do not click it."*
- **Test 3 — Browser Action**: *"Click the Submit button."*
- **Test 4 — Form Interaction**: *"Enter 'Test' into the First Name field and 'User' into the Last Name field."*
- **Test 5 — Privacy Detection**: *"Identify all sensitive personal information on this page. Verify that sensitive information is masked before AI processing."*

---

## 🔐 Privacy Demonstration

The core difference between raw webpage information and AI-visible information:

| Original Webpage | Sanitized AI Context |
| :--- | :--- |
| **Name:** John Alexander | **Name:** `[REDACTED]` |
| **Email:** john.alexander@gmail.com | **Email:** `[REDACTED]` |
| **Phone:** +91 9876543210 | **Phone:** `[REDACTED]` |
| **Address:** 12 Example Street | **Address:** `[REDACTED]` |
| **Password:** ******** | **Password:** `[REDACTED]` |

The AI understands the structure without seeing the actual private values:
- Email field → sensitive
- Phone field → sensitive
- Password field → sensitive
- Submit button → normal UI element

---

## 🔄 How MaskAgent Works

```text
1. User provides a task
            ↓
2. MaskAgent scans the webpage
            ↓
3. DOM/UI elements are identified
            ↓
4. Sensitive information is detected
            ↓
5. Sensitive information is masked
            ↓
6. Sanitized context is prepared
            ↓
7. Local Ollama model receives context
            ↓
8. AI determines the next action
            ↓
9. MaskAgent validates the action
            ↓
10. Browser performs the action
            ↓
11. Page state is re-checked
            ↓
12. Agent completes or continues task
```

---

## 🛡️ Privacy Architecture

```text
              RAW WEBPAGE
                   │
                   ▼
          ┌─────────────────┐
          │ Privacy Layer   │
          └────────┬────────┘
                   │
           Sensitive Data
              REDACTED
                   │
                   ▼
          ┌─────────────────┐
          │ Sanitized Data  │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Local AI Model  │
          └─────────────────┘
```

---

## ⚠️ Security Considerations

MaskAgent is currently a research/development prototype.

Do not test the extension with real:
- Passwords
- Banking information
- Credit/debit card numbers
- Government identification numbers
- Private documents
- Confidential company information

*Use synthetic test data during development.*

---

## 🧪 Current Development Status

### Completed
- [x] Browser extension structure (MV3)
- [x] MaskAgent popup UI
- [x] DOM processing
- [x] Privacy masking/redaction (DOM + Canvas)
- [x] Local Ollama integration
- [x] DeepSeek-Coder model integration
- [x] Chrome extension → Ollama communication
- [x] Ollama CORS/origin configuration
- [x] Agent activity stream
- [x] Basic browser action execution
- [x] Local privacy testing

### In Development
- [ ] More accurate PII detection
- [ ] Strict structured AI responses
- [ ] Action validation & confirmation
- [ ] Improved task completion detection
- [ ] Prompt-injection protection
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 📈 Future Roadmap

- **Phase 1 — Privacy**: DOM PII masking, Password masking, Email detection, Phone detection, Advanced PII detection, Visual OCR-based PII detection.
- **Phase 2 — Agent Intelligence**: Local LLM integration, Browser action execution, Structured JSON actions, Action validation, Task completion detection.
- **Phase 3 — Security**: Prompt injection detection, Webpage instruction isolation, Action permission system, Privacy audit log.
- **Phase 4 — Performance**: Lightweight model support, CPU optimization, Reduced inference latency, Efficient DOM extraction.
- **Phase 5 — Browser Support**: Chromium development (Chrome, Brave, Edge), Firefox compatibility.

---

## 📊 Privacy-First Comparison

| Capability | Traditional Cloud Agent | MaskAgent |
| :--- | :---: | :---: |
| Browser understanding | ✅ | ✅ |
| AI automation | ✅ | ✅ |
| Local AI inference | ❌ / Optional | ✅ |
| Pre-AI privacy layer | Usually ❌ | ✅ |
| DOM redaction | Usually ❌ | ✅ |
| Password masking | Depends | ✅ |
| Local Ollama support | ❌ | ✅ |
| Activity monitoring | Depends | ✅ |
| **Privacy-focused architecture** | Limited | ⭐ **Core objective** |

---

## 🖥️ Example Agent Flow

```text
USER
 │
 │ "Find the Submit button"
 ▼
MASKAGENT
 │
 ├── Scan webpage
 ├── Detect sensitive information
 ├── Mask sensitive elements
 └── Create sanitized context
 │
 ▼
LOCAL OLLAMA (DeepSeek-Coder)
 │
 ▼
AI DECISION
 │
 └── CLICK → submit_button
 │
 ▼
ACTION VALIDATOR
 │
 ├── Is action allowed?
 ├── Does target exist?
 └── Is target relevant?
 │
 ▼
BROWSER
 │
 └── Click Submit
```

---

## 👨‍💻 Author

**BHUVANESH M**
*Computer Science & Engineering*
*AI • Machine Learning • GenAI • Software Development*

---

## ⭐ Project Vision

MaskAgent explores a simple but important question:

> **Can AI agents interact with the web without needing unrestricted access to our private information?**

```text
             AI AGENT
                │
        ┌───────▼────────┐
        │ Privacy Layer  │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Local Context  │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Local AI Model │
        └───────┬────────┘
                │
                ▼
          BROWSER ACTION
```

*See the web. Protect the user. Act locally.*
