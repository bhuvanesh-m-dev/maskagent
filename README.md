<div align="center">

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/maskagent.png" alt="MaskAgent" width="150">

# MaskAgent

### On-device visual perception for lightweight browser agents

**Smart India Hackathon 2026 · Problem Statement ID: SIH26171**

[Open the project site](https://bhuvanesh-m-dev.github.io/maskagent/) · [Developers guide](https://bhuvanesh-m-dev.github.io/maskagent/developers.html) · [Meet the team](https://bhuvanesh-m-dev.github.io/maskagent/team.html)

<br>

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/isro.webp" alt="ISRO" height="70">&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/sih2026.png" alt="Smart India Hackathon 2026" height="70">

</div>

---

## Overview

MaskAgent is a privacy-focused Manifest V3 browser extension that helps lightweight browser agents understand and interact with web pages without exposing raw personal information to an AI model.

It combines:

- DOM and visible UI understanding
- On-device PII detection and redaction
- Local AI inference through Ollama
- Validated browser actions
- A human-readable activity stream

The core principle is simple:

> **Private information should be protected before AI processing, not after it.**

## Why MaskAgent?

Browser agents can find buttons, read page structure, fill forms, navigate websites, and perform repetitive tasks. However, a page may also contain names, email addresses, phone numbers, addresses, passwords, and other sensitive information.

A traditional flow may send the complete page context to a remote AI service:

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme-1.jpg" alt="Smart India Hackathon 2026" height="600">

MaskAgent creates a privacy boundary before reasoning:

```text
Web page
   |
   v
DOM + visual UI scan
   |
   v
Sensitive data detection
   |
   v
Redaction and masking
   |
   v
Sanitized page context
   |
   v
Local AI through Ollama
   |
   v
Validated browser action
```

The model can understand the page structure and decide what to do without receiving the original sensitive values.

## Key capabilities

### Privacy-preserving processing

MaskAgent attempts to identify and mask sensitive values before they are included in the AI context. Current target categories include:

- Names and personal identifiers
- Email addresses
- Phone numbers
- Addresses
- Password fields
- Dates of birth and other PII

### DOM and visual understanding

The extension combines page structure with visible interface context to identify:

- Text fields and password fields
- Buttons and links
- Labels and form elements
- Page regions and visible controls
- Useful targets for browser actions

### Local AI inference

MaskAgent can communicate with an Ollama server running on the user's device. The default development model is `deepseek-coder`; compatible local models can be configured for different workloads.

No webpage context needs to be sent to a hosted AI API when the local setup is used.

### Browser agent actions

The agent can reason about and execute structured actions such as:

```text
CLICK   TYPE   SCROLL   SELECT   DONE
```

Actions should be checked against the page and user intent before execution.

### Activity stream

The extension exposes the agent's progress so the user can understand what happened:

```text
[task] Starting MaskAgent task
[privacy] Redaction: ON
[scan] Inspecting DOM and visible UI
[mask] Sensitive elements sanitized
[model] Consulting local Ollama model
[action] Decision: CLICK
[done] Action validated and completed
```

## Project architecture

```text
+------------------------------------------------+
| Browser                                        |
|                                                |
|  +------------------------------------------+  |
|  | MaskAgent extension                      |  |
|  |                                          |  |
|  | Popup UI -> Background service           |  |
|  |                 |                        |  |
|  |                 v                        |  |
|  |          Content script                  |  |
|  |                 |                        |  |
|  |                 v                        |  |
|  |       DOM/UI analysis + PII masking      |  |
|  +-----------------+------------------------+  |
|                    |                           |
+--------------------|---------------------------+
                     | Local API
                     v
             Ollama / local model
             DeepSeek-Coder or another model
```

## Repository structure

```text
MaskAgent/
├── manifest.json       Manifest V3 extension configuration
├── background.js       Service worker and Ollama communication
├── content.js          DOM interaction and privacy processing
├── popup.html          Extension popup interface
├── popup.js            Popup controls and agent execution
├── styles.css          Extension interface styles
├── icon16.png          Toolbar icon
├── icon48.png          Extension icon
├── icon128.png         Extension icon
├── index.html          Project landing page
├── team.html           Team showcase page
├── developers.html     Developer documentation page
└── README.md           Project documentation
```

## Technology stack

| Area | Technology |
| :--- | :--- |
| Extension | HTML5, CSS3, JavaScript, Chrome Extension APIs |
| Extension standard | Manifest V3 |
| Local AI | Ollama and DeepSeek-Coder |
| Privacy layer | DOM-based PII detection, masking, redaction |
| Browser support | Chrome, Brave, Edge, and Chromium-compatible browsers |
| Development environments | Linux, Windows, and macOS |

## Quick start

### Requirements

1. A Chromium-based browser such as Chrome, Brave, or Edge
2. Ollama installed and running locally
3. A compatible local model
4. The MaskAgent source folder

### Install and configure Ollama

Verify Ollama:

```bash
ollama --version
ollama list
```

Install the default development model if necessary:

```bash
ollama pull deepseek-coder
```

Test the local API:

```bash
curl http://localhost:11434/api/tags
```

Test model generation:

```bash
curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder:latest",
    "prompt": "Say hello in one sentence.",
    "stream": false
  }'
```

### Allow the extension origin

If Ollama runs as a Linux systemd service, open an override file:

```bash
sudo systemctl edit ollama.service
```

Add:

```ini
[Service]
Environment="OLLAMA_ORIGINS=chrome-extension://*"
```

Then reload the service:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
systemctl show ollama --property=Environment --no-pager
```

### Load the extension

1. Open `chrome://extensions` or the equivalent extensions page.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the MaskAgent project folder.
5. Open the extension popup and run a task on a test page.

For the full developer workflow, architecture notes, and action contract, visit the [MaskAgent Developers Guide](https://bhuvanesh-m-dev.github.io/maskagent/developers.html).

## Safe testing

Use synthetic data only. Never test with real passwords, banking information, government IDs, private documents, or confidential company data.

Example test values:

```html
<label>Full Name</label>
<input type="text" value="John Alexander">

<label>Email</label>
<input type="email" value="john.alexander@example.com">

<label>Phone</label>
<input type="tel" value="+91 9876543210">

<label>Password</label>
<input type="password" value="TestPassword123">
```

Useful prompts include:

- Identify all form fields without changing them.
- Find the Submit button without clicking it.
- Identify sensitive information and verify that it is masked.
- Enter test data into a named field without submitting the form.

## Privacy demonstration

Before masking:

```text
Name:     John Alexander
Email:    john.alexander@gmail.com
Phone:    +91 9876543210
Address:  12 Example Street, Chennai
Password: ********
```

AI-visible context after masking:

```text
Name:     [REDACTED]
Email:    [REDACTED]
Phone:    [REDACTED]
Address:  [REDACTED]
Password: [REDACTED]
```

The goal is to preserve useful meaning such as `Email field -> sensitive` and `Submit button -> normal UI element` while removing the original values.

## Development status

### Working areas

- Browser extension structure and popup UI
- DOM processing and privacy masking
- Local Ollama integration
- Basic browser action execution
- Activity stream and local privacy testing

### In progress

- More accurate PII and visual PII detection
- OCR-based visual perception
- Structured model responses
- Stronger action validation
- Prompt-injection protection
- Better task completion detection
- Performance and cross-browser testing

## Roadmap

1. **Privacy:** Improve PII detection, password handling, OCR, and masking accuracy.
2. **Agent intelligence:** Add structured actions, planning, validation, and completion detection.
3. **Security:** Add prompt-injection detection, webpage instruction isolation, permission controls, and audit logs.
4. **Performance:** Support lightweight models, context compression, and efficient DOM extraction.
5. **Browser support:** Continue Chromium support and explore Firefox compatibility.

## Limitations

MaskAgent is a research and development prototype. Privacy detection can produce false positives or miss unusual formats. Dynamic pages, visual text, model mistakes, and unintended browser actions remain important areas for testing and improvement.

Local models may also require significant CPU and memory depending on the selected model and hardware.

## Team

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/immortal6.png" alt="MaskAgent team members" width="100%">

The MaskAgent team:

- Bhuvanesh M
- Hariseh Sanjay R
- Mohamed Saajid S
- Mohan Kumar S
- Preethi Kumari R
- Sharon Rose C

Read the full team story at the [MaskAgent Team page](https://bhuvanesh-m-dev.github.io/maskagent/team.html).

## Project links

- [Project landing page](https://bhuvanesh-m-dev.github.io/maskagent/)
- [Developer documentation](https://bhuvanesh-m-dev.github.io/maskagent/developers.html)
- [Team page](https://bhuvanesh-m-dev.github.io/maskagent/team.html)
- [MaskAgent source repository](https://github.com/bhuvanesh-m-dev/maskagent)


<div align="center">

**See the web. Protect the user. Act locally.**

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/isro.webp" alt="ISRO" height="55">&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/sih2026.png" alt="Smart India Hackathon 2026" height="55">

</div>
