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

<br>

### What is MaskAgent?

**MaskAgent is a privacy-first browser agent for privacy-preserving AI browser automation. It combines DOM and visual webpage perception with local sensitive-data detection and masking before AI reasoning. The system is designed to keep raw sensitive webpage information within the local privacy boundary while providing sanitized context to a local AI model for browser actions such as Click, Type, Scroll, and Select.**

**Core principle: Perceive Locally → Protect Locally → Reason Intelligently.**

## MaskAgent at a glance

| Attribute | Details |
|---|---|
| Project | MaskAgent |
| Category | Privacy-first AI browser agent |
| Primary purpose | Privacy-preserving browser automation |
| Browser platform | Chromium-based browsers |
| Extension standard | Manifest V3 |
| Perception | DOM + visual webpage understanding |
| Privacy layer | Local sensitive-data detection and masking |
| AI runtime | Ollama |
| Default development model | `deepseek-coder` |
| Browser actions | Click, Type, Scroll, Select |
| AI architecture | Local / on-device AI reasoning |
| Event | Smart India Hackathon 2026 |
| Problem Statement | SIH26171 |
| Problem | On-device Visual Perception for Light-weight Browser Agents |


---
<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/6.jpg" alt="Smart India Hackathon 2026" height="600">


## Why MaskAgent?

Modern **AI browser agents** can inspect webpages, understand page structure, fill forms, navigate websites, and perform repetitive browser automation tasks. However, webpages may also contain **personally identifiable information (PII)** such as names, email addresses, phone numbers, addresses, passwords, dates of birth, and other sensitive information.

MaskAgent addresses this **AI browser-agent privacy problem** by introducing a local privacy boundary before AI reasoning.


A traditional flow may send the complete page context to a remote AI service:

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/1.jpg" alt="Smart India Hackathon 2026" height="600">

MaskAgent creates a privacy boundary before reasoning:

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/2.jpg" alt="Smart India Hackathon 2026" height="600">

The model can understand the page structure and decide what to do without receiving the original sensitive values.

### How does MaskAgent work?

MaskAgent follows a privacy-first browser-agent pipeline:

1. **Webpage perception** — The browser extension observes the webpage and its structure.
2. **DOM and visual analysis** — MaskAgent analyzes webpage structure and visible interface elements.
3. **Sensitive-data detection** — Potential PII and other sensitive values are identified.
4. **Local masking** — Detected sensitive information is masked before AI reasoning.
5. **Sanitized context** — Protected webpage context is prepared for the reasoning layer.
6. **Local AI reasoning** — Ollama runs the configured local AI model.
7. **Browser action** — The agent performs validated actions such as Click, Type, Scroll, or Select.

The intended privacy boundary is:

**Raw webpage data → Local protection → Sanitized context → AI reasoning → Browser action**

## Key capabilities

MaskAgent combines **privacy-preserving webpage processing, DOM and visual understanding, local AI inference, and browser automation** into a privacy-first AI browser-agent architecture.

### Key terminology

**AI browser agent** — An AI-powered system that can understand and interact with webpages to perform tasks.

**PII** — Personally Identifiable Information, such as names, email addresses, phone numbers, addresses, passwords, and dates of birth.

**DOM** — Document Object Model, the structured representation of a webpage used by browser scripts.

**Privacy boundary** — The boundary between local sensitive-data processing and AI reasoning.

**Sanitized context** — Webpage context in which detected sensitive information has been masked, redacted, or replaced before AI reasoning.

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

MaskAgent can communicate with an **Ollama** server running on the user's device. The default development model is `deepseek-coder`; compatible local models can be configured for different workloads.

The local configuration is designed to use a local AI runtime rather than requiring a hosted AI API for model inference. MaskAgent also applies its privacy-processing layer before AI reasoning.

### Browser agent actions

The agent can reason about and execute structured actions such as:

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/5.jpg" alt="Smart India Hackathon 2026" height="600">

Actions should be checked against the page and user intent before execution.

### Activity stream

The extension exposes the agent's progress so the user can understand what happened:

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/3.jpg" alt="Smart India Hackathon 2026" height="600">

## Project architecture

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/4.jpg" alt="Smart India Hackathon 2026" height="600">

### Architecture summary

The MaskAgent browser extension contains the browser-facing components, including the popup interface, background service, content script, and DOM/UI analysis.

Sensitive-data detection and masking occur before the sanitized context is provided to the local AI reasoning layer. The local AI layer communicates with Ollama through a local API.

**Browser → MaskAgent Extension → DOM/UI Analysis → Sensitive-data Detection & Masking → Local Ollama AI → Validated Browser Action**

## Repository structure

```text
MaskAgent/
├── manifest.json       Manifest V3 extension configuration and permissions
├── background.js       Service worker, task orchestration, and Ollama communication
├── content.js          Webpage DOM analysis, sensitive-data detection, masking, and browser interaction
├── popup.html          MaskAgent extension interface
├── popup.js            Popup controls and browser-agent task execution
├── styles.css          Extension interface styles
├── icon16.png          Toolbar icon
├── icon48.png          Extension icon
├── icon128.png         Extension icon
├── index.html          Project landing page
├── team.html           Team showcase page
├── developers.html     Developer documentation page
└── README.md           Project documentation
```

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/readme/7.jpg" alt="Smart India Hackathon 2026" height="600">

## Technologies and concepts

MaskAgent is built around the following technologies and concepts:

- AI browser agents
- Browser automation
- Privacy-preserving AI
- Local AI inference
- DOM analysis
- Visual webpage perception
- Personally Identifiable Information (PII) detection
- Sensitive-data masking
- Chromium browser extensions
- Manifest V3
- JavaScript
- HTML
- CSS
- Ollama
- DeepSeek-Coder
- WebGPU
- WebAssembly
- Local / edge AI

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

## Frequently asked questions

### What is MaskAgent?

MaskAgent is a privacy-first browser agent designed for privacy-preserving AI browser automation.

### What problem does MaskAgent solve?

MaskAgent addresses the risk of exposing sensitive webpage information to AI browser agents during automated browser tasks.

### Does MaskAgent detect PII?

MaskAgent is designed to identify sensitive information such as names, email addresses, phone numbers, addresses, password fields, and dates of birth.

### Does MaskAgent use local AI?

Yes. The current development configuration uses Ollama for local AI inference.

### What AI model does MaskAgent use?

The default development configuration uses `deepseek-coder` through Ollama.

### What browser actions does MaskAgent support?

The current browser-agent workflow includes Click, Type, Scroll, and Select actions.

### Does MaskAgent send webpage data to the cloud?

The local configuration is designed to use Ollama running on the user's device rather than a hosted AI API. MaskAgent also applies its privacy-processing layer before AI reasoning.

### Is MaskAgent production-ready?

No. MaskAgent is currently a research and development prototype. Detection accuracy, dynamic webpage handling, browser-agent reliability, performance, and security remain active development areas.

### What is the SIH problem statement?

MaskAgent was developed for Smart India Hackathon 2026 Problem Statement **SIH26171**, "On-device Visual Perception for Light-weight Browser Agents."

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

## Project summary

**MaskAgent is a privacy-first AI browser agent focused on privacy-preserving browser automation.** It combines DOM analysis, visible webpage understanding, sensitive-data/PII detection, local masking, sanitized AI context, local Ollama inference, and validated browser actions.

The project addresses the problem of sensitive webpage information being unnecessarily exposed during AI-assisted browser automation. Its core architecture is **Perceive Locally → Protect Locally → Reason Intelligently**.

MaskAgent is a **research and development prototype** for Smart India Hackathon 2026 Problem Statement **SIH26171: On-device Visual Perception for Light-weight Browser Agents**. Current development areas include visual PII detection, OCR-based perception, structured model responses, action validation, prompt-injection protection, task completion detection, performance optimization, and cross-browser testing.

### Canonical project terms

`MaskAgent` · `privacy-first browser agent` · `AI browser agent` · `privacy-preserving AI` · `browser automation` · `PII detection` · `sensitive-data masking` · `on-device AI` · `local AI` · `DOM analysis` · `visual webpage perception` · `Ollama` · `DeepSeek-Coder` · `Manifest V3` · `WebGPU` · `WebAssembly` · `Smart India Hackathon 2026` · `SIH26171`

<div align="center">

**See the web. Protect the user. Act locally.**

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/isro.webp" alt="ISRO" height="55">&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/maskagent/refs/heads/main/img/sih2026.png" alt="Smart India Hackathon 2026" height="55">

</div>
