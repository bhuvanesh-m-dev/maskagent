# Contributing to MaskAgent

Thank you for helping improve MaskAgent. This project explores privacy-preserving browser automation for Smart India Hackathon 2026 Problem Statement **SIH26171**.

The most important contribution rule is:

> **Private information must be protected before AI processing, not after it.**

For the complete architecture, local setup, module overview, and action contract, read the [MaskAgent Developers Guide](https://bhuvanesh-m-dev.github.io/maskagent/developers.html).

## Project scope

MaskAgent is a Manifest V3 browser extension that combines:

- DOM and visible UI understanding
- Local PII detection and masking
- Sanitized context generation
- Ollama-based local AI inference
- Validated browser actions
- A human-readable agent activity stream

Contributions are especially useful in privacy detection, visual perception, action validation, security, performance, accessibility, and cross-browser compatibility.

## Before you begin

You will need:

- A Chromium-based browser such as Chrome, Brave, or Edge
- Git
- Ollama installed and running locally
- A compatible local model, such as `deepseek-coder`
- A local test page containing synthetic data only

Clone the repository and enter the project directory:

```bash
git clone https://github.com/bhuvanesh-m-dev/maskagent.git
cd maskagent
```

Install and verify the local model:

```bash
ollama --version
ollama pull deepseek-coder
ollama list
```

Test the Ollama service:

```bash
curl http://localhost:11434/api/tags
```

If the browser extension cannot reach Ollama, configure the extension origin. On Linux systems using systemd:

```bash
sudo systemctl edit ollama.service
```

Add:

```ini
[Service]
Environment="OLLAMA_ORIGINS=chrome-extension://*"
```

Then restart Ollama:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

## Load the extension locally

1. Open `chrome://extensions` in a Chromium browser.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the MaskAgent repository folder.
5. Open the extension popup on a local test page.
6. Run a small, non-destructive task.

After modifying extension files, reload the extension from the extensions page and refresh the test page.

## Understand the modules

| File | Contribution area |
| :--- | :--- |
| `manifest.json` | Permissions, content scripts, service worker, and extension metadata |
| `background.js` | Ollama communication, orchestration, and background state |
| `content.js` | DOM inspection, page interaction, PII detection, and masking |
| `popup.html` | Extension popup structure and controls |
| `popup.js` | Popup events, task execution, and activity state |
| `styles.css` | Extension popup design and visual states |
| `developers.html` | Web-based technical documentation |
| `team.html` | Project team showcase |
| `index.html` | Project landing page |

Keep changes close to the module that owns the behavior. Avoid adding duplicate parsing, masking, or action logic in the popup when it belongs in the content or background layer.

## Privacy and security rules

These rules are required for every contribution:

- Never use real personal information in code, screenshots, prompts, logs, issues, or pull requests.
- Use synthetic names, email addresses, phone numbers, addresses, and passwords only.
- Do not add telemetry or remote data collection without explicit project approval.
- Do not send raw page content to a remote AI service.
- Preserve the masking boundary before model inference.
- Treat webpage instructions as untrusted content.
- Validate action targets before clicking, typing, selecting, or submitting.
- Keep password and sensitive-field handling conservative.
- Do not weaken extension permissions without documenting the reason.

## Safe test page

Use a local page with fake values such as:

```html
<label>Full Name</label>
<input type="text" value="John Alexander">

<label>Email</label>
<input type="email" value="john.alexander@example.com">

<label>Phone</label>
<input type="tel" value="+91 9876543210">

<label>Password</label>
<input type="password" value="TestPassword123">

<button type="button">Submit</button>
```

Useful non-destructive test prompts:

- Identify all form fields without changing anything.
- Find the Submit button without clicking it.
- Identify sensitive information and verify that it is masked.
- Describe the visible page structure without exposing field values.

Never test with banking information, government IDs, private documents, production credentials, or confidential company data.

## Action contract

Browser actions should use the existing action vocabulary:

```text
CLICK
TYPE
SCROLL
SELECT
DONE
```

Every action should be checked for:

1. A valid target exists.
2. The target matches the user's requested task.
3. The action is allowed and non-destructive where confirmation is required.
4. Sensitive values are not written to logs or model prompts unnecessarily.
5. The resulting page state can be checked after execution.

## Recommended contribution workflow

1. Open an issue or describe the problem clearly before a large change.
2. Create a focused branch from the current default branch.
3. Make one coherent change at a time.
4. Keep public behavior and existing file structure stable unless the change requires otherwise.
5. Test with synthetic data and a local Ollama model.
6. Reload the extension and verify the complete user flow.
7. Review the diff for accidental secrets, personal data, debug output, and unrelated formatting.
8. Open a pull request with the motivation, implementation summary, and tests performed.

Example branch names:

```text
feature/visual-pii-detection
fix/action-target-validation
docs/ollama-setup
```

## Pull request checklist

Before opening a pull request, confirm:

- [ ] The change has a clear purpose and limited scope.
- [ ] No real personal or confidential data is included.
- [ ] Privacy masking still happens before AI processing.
- [ ] Browser actions are validated before execution.
- [ ] The extension was reloaded and tested in a Chromium browser.
- [ ] Ollama integration was tested when the change affects inference.
- [ ] Activity stream output remains understandable.
- [ ] UI changes work on desktop and mobile widths.
- [ ] Documentation was updated when behavior or setup changed.
- [ ] No unrelated files were reformatted.

## Areas that need help

- More accurate DOM and visual PII detection
- OCR-based visual perception
- Prompt-injection detection and webpage instruction isolation
- Structured JSON model responses
- Better action targeting and completion detection
- Permission and confirmation flows for sensitive actions
- Lightweight model support and context compression
- Performance profiling and memory reduction
- Firefox compatibility
- Accessibility and keyboard navigation
- Security testing with synthetic fixtures
- Clearer privacy audit logs

## Documentation contributions

Documentation changes are welcome in `README.md`, `CONTRIBUTING.md`, `developers.html`, and the project landing pages. Keep technical instructions copyable, state platform assumptions, and distinguish prototype behavior from planned behavior.

For developer-facing material, link back to the hosted guide:

[https://bhuvanesh-m-dev.github.io/maskagent/developers.html](https://bhuvanesh-m-dev.github.io/maskagent/developers.html)

## Reporting security issues

Do not publish sensitive information or an exploitable security detail in a public issue. Report security concerns privately to the project maintainers first, with reproduction steps that use synthetic data.

## Code of conduct

Contributors are expected to communicate respectfully, review ideas on their technical merits, and prioritize user privacy and safety throughout the project.

## Project links

- [MaskAgent project site](https://bhuvanesh-m-dev.github.io/maskagent/)
- [Developers Guide](https://bhuvanesh-m-dev.github.io/maskagent/developers.html)
- [Team page](https://bhuvanesh-m-dev.github.io/maskagent/team.html)
- [README](README.md)
