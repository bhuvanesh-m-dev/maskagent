// MaskAgent Content Script - DOM Indexing, Privacy Redaction, and Action Execution
(() => {
  if (window.__maskAgentInjected) return;
  window.__maskAgentInjected = true;

  const BADGE_CLASS = 'maskagent-interactive-badge';
  const REDACTION_CLASS = 'maskagent-dom-redact-mask';

  // Listen for messages from Background Service Worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'GET_DOM_STATE') {
      const state = captureDOMState(message.enableRedaction);
      sendResponse(state);
    } else if (message.action === 'EXECUTE_ACTION') {
      executeAgentAction(message.payload)
        .then(result => sendResponse({ success: true, result }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // async response
    } else if (message.action === 'SHOW_BADGES') {
      toggleBadges(true);
      sendResponse({ success: true });
    } else if (message.action === 'REMOVE_BADGES') {
      toggleBadges(false);
      sendResponse({ success: true });
    }
  });

  /**
   * Scans interactive elements & PII fields for privacy redaction
   */
  function captureDOMState(enableRedaction = true) {
    toggleBadges(false); // remove previous badges
    
    const interactiveElements = [];
    const redactionBoxes = [];
    
    // 1. Scan sensitive PII fields & DOM elements for image redaction coordinates
    if (enableRedaction) {
      const sensitiveSelectors = [
        'input[type="password"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[autocomplete*="cc-"]',
        'input[name*="password" i]',
        'input[name*="pass" i]',
        'input[name*="ssn" i]',
        'input[name*="credit" i]',
        'input[name*="card" i]',
        'input[name*="cvv" i]',
        'input[name*="otp" i]',
        'input[name*="pin" i]',
        '[data-sensitive="true"]'
      ];
      
      const sensitiveNodes = document.querySelectorAll(sensitiveSelectors.join(','));
      sensitiveNodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          redactionBoxes.push({
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          });
        }
      });

      // Regex scan visible text nodes for emails & phone numbers
      scanTextForPII(document.body, redactionBoxes);
    }

    // 2. Discover interactive elements
    const selectors = [
      'a[href]',
      'button',
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="menuitem"]',
      '[tabindex]:not([tabindex="-1"])',
      'div[onclick]',
      'span[onclick]'
    ];

    const nodes = document.querySelectorAll(selectors.join(','));
    let idCounter = 1;

    nodes.forEach(node => {
      if (!isElementVisible(node)) return;

      const rect = node.getBoundingClientRect();
      const tag = node.tagName.toLowerCase();
      const isSensitive = isSensitiveInput(node);

      let textContent = (node.innerText || node.value || node.getAttribute('aria-label') || node.placeholder || '').trim();
      textContent = textContent.replace(/\s+/g, ' ').slice(0, 60);

      // Redact DOM text representation if sensitive
      if (enableRedaction && isSensitive) {
        textContent = '[REDACTED_SENSITIVE_DATA]';
      }

      // Tag element with dataset ID for easy querying
      node.dataset.maskagentId = idCounter;

      interactiveElements.push({
        id: idCounter,
        tag: tag,
        type: node.type || '',
        text: textContent,
        placeholder: enableRedaction && isSensitive ? '[REDACTED]' : (node.placeholder || ''),
        isSensitive: isSensitive,
        rect: {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        }
      });

      idCounter++;
    });

    // Optionally overlay visual badge labels before screenshot capture
    overlayBadges(interactiveElements);

    return {
      url: window.location.href,
      title: document.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      },
      interactiveElements: interactiveElements.slice(0, 50), // Cap at top 50 for prompt size optimization
      redactionBoxes: redactionBoxes
    };
  }

  /**
   * Helper to check if an element is visible on screen
   */
  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Check if input node holds sensitive PII
   */
  function isSensitiveInput(node) {
    if (!node) return false;
    const type = (node.type || '').toLowerCase();
    if (type === 'password') return true;
    
    const attrStr = `${node.name || ''} ${node.id || ''} ${node.placeholder || ''} ${node.getAttribute('autocomplete') || ''}`.toLowerCase();
    const sensitiveKeywords = ['password', 'pass', 'ssn', 'credit', 'card', 'cvv', 'cvc', 'otp', 'secret', 'pin', 'token'];
    return sensitiveKeywords.some(kw => attrStr.includes(kw));
  }

  /**
   * Scan text nodes in viewport for email and phone PII to get redaction bounding rects
   */
  function scanTextForPII(rootNode, redactionBoxes) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let limit = 0;

    while ((node = walker.nextNode()) && limit < 150) {
      limit++;
      const text = node.nodeValue;
      if (!text || text.length < 5) continue;

      if (emailRegex.test(text) || phoneRegex.test(text)) {
        const parent = node.parentElement;
        if (parent && isElementVisible(parent)) {
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            redactionBoxes.push({
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            });
          }
        }
      }
    }
  }

  /**
   * Draws temporary numerical ID badges over elements for visual grounding
   */
  function overlayBadges(elements) {
    let container = document.getElementById('maskagent-badge-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'maskagent-badge-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '2147483647';
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    elements.forEach(item => {
      const badge = document.createElement('div');
      badge.className = BADGE_CLASS;
      badge.textContent = item.id;
      badge.style.position = 'absolute';
      badge.style.left = `${item.rect.x + window.scrollX}px`;
      badge.style.top = `${item.rect.y + window.scrollY}px`;
      badge.style.background = '#6366f1';
      badge.style.color = '#ffffff';
      badge.style.fontSize = '10px';
      badge.style.fontWeight = 'bold';
      badge.style.padding = '1px 5px';
      badge.style.borderRadius = '4px';
      badge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
      badge.style.border = '1px solid #ffffff';
      badge.style.lineHeight = '1.2';
      container.appendChild(badge);
    });
  }

  /**
   * Toggles visual badges visibility
   */
  function toggleBadges(show) {
    const container = document.getElementById('maskagent-badge-container');
    if (container) {
      container.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Executes AI agent action on page DOM
   */
  async function executeAgentAction(payload) {
    const { action, target_id, text, direction } = payload;

    if (action === 'finish') {
      return { status: 'finished', message: payload.reason || 'Task completed successfully' };
    }

    if (action === 'scroll') {
      const scrollAmount = direction === 'up' ? -500 : 500;
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 600));
      return { status: 'scrolled', direction: direction };
    }

    // Find target element by dataset ID
    const targetEl = document.querySelector(`[data-maskagent-id="${target_id}"]`);
    if (!targetEl) {
      throw new Error(`Target element [${target_id}] not found on page.`);
    }

    // Scroll into view & highlight
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightElement(targetEl);
    await new Promise(r => setTimeout(r, 400));

    if (action === 'click') {
      simulateClick(targetEl);
      return { status: 'clicked', target_id: target_id };
    } else if (action === 'type') {
      simulateType(targetEl, text || '');
      return { status: 'typed', target_id: target_id, text: text };
    }

    throw new Error(`Unknown action: ${action}`);
  }

  /**
   * Highlights active element briefly
   */
  function highlightElement(el) {
    const origOutline = el.style.outline;
    const origBoxShadow = el.style.boxShadow;
    el.style.outline = '3px solid #06b6d4';
    el.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.8)';

    setTimeout(() => {
      el.style.outline = origOutline;
      el.style.boxShadow = origBoxShadow;
    }, 1500);
  }

  /**
   * Simulates full mouse click sequence
   */
  function simulateClick(el) {
    el.focus();
    const mouseEvents = ['mousedown', 'mouseup', 'click'];
    mouseEvents.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      });
      el.dispatchEvent(event);
    });
    if (typeof el.click === 'function') {
      el.click();
    }
  }

  /**
   * Simulates realistic keyboard typing with event triggers
   */
  function simulateType(el, text) {
    el.focus();
    el.value = text;
    
    // Dispatch events for modern frameworks (React, Vue)
    ['input', 'change', 'keyup'].forEach(eventName => {
      const event = new Event(eventName, { bubbles: true });
      el.dispatchEvent(event);
    });
  }
})();
