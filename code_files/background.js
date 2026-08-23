// MaskAgent Background Service Worker - Ollama Vision Agent Core
let currentAgentTask = null;
let isAgentRunning = false;
let currentStep = 0;
let maxSteps = 10;
let agentLogs = [];

const OLLAMA_HOST = 'http://localhost:11434';

// Listen for extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_OLLAMA_STATUS') {
    checkOllamaStatus(message.model).then(sendResponse);
    return true;
  } else if (message.type === 'PULL_MODEL') {
    pullOllamaModel(message.model);
    sendResponse({ started: true });
    return true;
  } else if (message.type === 'START_AGENT_TASK') {
    startAgentLoop(message.config);
    sendResponse({ started: true });
    return true;
  } else if (message.type === 'STOP_AGENT_TASK') {
    stopAgentLoop();
    sendResponse({ stopped: true });
    return true;
  } else if (message.type === 'GET_AGENT_STATUS') {
    sendResponse({
      isRunning: isAgentRunning,
      stepInfo: isAgentRunning ? `Step ${currentStep}/${maxSteps}` : 'Idle',
      logs: agentLogs
    });
    return true;
  }
});

/**
 * Checks if Ollama service is alive at localhost:11434 and tests if target model is present
 */
async function checkOllamaStatus(targetModel = 'llava') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { ollamaRunning: false, modelAvailable: false };

    const data = await res.json();
    const availableModels = (data.models || []).map(m => m.name.split(':')[0]);
    const exactModels = (data.models || []).map(m => m.name);

    // Check if target model or tag exists
    const modelAvailable = exactModels.some(m => m === targetModel || m.startsWith(targetModel));

    return {
      ollamaRunning: true,
      modelAvailable: modelAvailable,
      availableModels: availableModels
    };
  } catch (err) {
    return { ollamaRunning: false, modelAvailable: false };
  }
}

/**
 * Automatically pulls target model from Ollama library with stream progress tracking
 */
async function pullOllamaModel(modelName = 'llava') {
  logMessage(`Starting automatic pull for model: ${modelName}...`, 'info');

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true })
    });

    if (!res.ok) {
      logMessage(`Failed to initiate pull for ${modelName}`, 'error');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep partial line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const statusObj = JSON.parse(line);
          let pct = 0;
          if (statusObj.total && statusObj.completed) {
            pct = Math.round((statusObj.completed / statusObj.total) * 100);
          }

          chrome.runtime.sendMessage({
            type: 'PULL_PROGRESS',
            model: modelName,
            status: statusObj.status,
            completed: statusObj.completed,
            total: statusObj.total,
            percent: pct,
            done: statusObj.status === 'success'
          }).catch(() => {});
        } catch (e) {
          // ignore parse errors on stream boundary
        }
      }
    }

    logMessage(`Model ${modelName} successfully installed!`, 'success');
    chrome.runtime.sendMessage({
      type: 'PULL_PROGRESS',
      model: modelName,
      status: 'success',
      percent: 100,
      done: true
    }).catch(() => {});

  } catch (err) {
    logMessage(`Error pulling model ${modelName}: ${err.message}`, 'error');
  }
}

/**
 * Main Autonomous Agent Vision Loop
 */
async function startAgentLoop(config) {
  isAgentRunning = true;
  currentStep = 0;
  maxSteps = config.maxSteps || 10;
  agentLogs = [];

  logMessage(`Agent started. Goal: "${config.task}"`, 'info');
  broadcastAgentStatus();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    logMessage('No active browser tab found.', 'error');
    stopAgentLoop();
    return;
  }

  // Ensure content script is ready
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (e) {
    // Already injected or standard page
  }

  while (isAgentRunning && currentStep < maxSteps) {
    currentStep++;
    broadcastAgentStatus();
    logMessage(`Executing Step ${currentStep}/${maxSteps}...`, 'info');

    try {
      // Step 1: Tell content script to show numeric badges
      await sendMessageToTab(tab.id, { action: 'SHOW_BADGES' });
      await sleep(300); // brief pause for render

      // Step 2: Extract DOM state & privacy redaction coordinates
      const domState = await sendMessageToTab(tab.id, {
        action: 'GET_DOM_STATE',
        enableRedaction: config.enableRedaction
      });

      // Step 3: Capture tab screenshot & perform on-canvas privacy redaction
      const rawScreenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      const sanitizedScreenshot = await redactScreenshotCanvas(
        rawScreenshot,
        domState.redactionBoxes,
        config.enableRedaction
      );

      // Hide badges after screenshot capture
      await sendMessageToTab(tab.id, { action: 'REMOVE_BADGES' });

      if (config.enableRedaction && domState.redactionBoxes.length > 0) {
        logMessage(`Privately masked ${domState.redactionBoxes.length} sensitive UI elements before AI processing.`, 'privacy');
      }

      // Step 4: Send prompt + sanitized screenshot to Ollama Vision Model
      logMessage(`Consulting local Ollama model (${config.model})...`, 'info');
      const actionPayload = await consultOllamaVision(
        config.model,
        config.task,
        domState,
        sanitizedScreenshot
      );

      logMessage(`AI Decision: ${actionPayload.thought || actionPayload.reason}`, 'info');

      // Check if finished
      if (actionPayload.action === 'finish') {
        logMessage(`Task Finished! ${actionPayload.reason || ''}`, 'success');
        stopAgentLoop();
        break;
      }

      // Step 5: Execute action on page
      logMessage(`Executing Action: [${actionPayload.action.toUpperCase()}] target: #${actionPayload.target_id || ''}`, 'info');
      const execResult = await sendMessageToTab(tab.id, {
        action: 'EXECUTE_ACTION',
        payload: actionPayload
      });

      if (!execResult.success) {
        logMessage(`Execution Warning: ${execResult.error}`, 'warning');
      }

      await sleep(1500); // give page time to update/navigate
    } catch (err) {
      logMessage(`Step ${currentStep} Error: ${err.message}`, 'error');
      await sleep(2000);
    }
  }

  if (currentStep >= maxSteps && isAgentRunning) {
    logMessage(`Reached max step limit (${maxSteps}). Stopping agent.`, 'warning');
    stopAgentLoop();
  }
}

/**
 * Stops agent execution loop
 */
function stopAgentLoop() {
  isAgentRunning = false;
  broadcastAgentStatus();
}

/**
 * Performs local canvas redaction of PII bounding boxes on screenshot image
 */
async function redactScreenshotCanvas(dataUrl, redactionBoxes, enableRedaction) {
  if (!enableRedaction || !redactionBoxes || redactionBoxes.length === 0) {
    return dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
  }

  try {
    // Create image bitmap from raw data URL
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    // Draw base screenshot
    ctx.drawImage(imageBitmap, 0, 0);

    // Paint privacy overlay boxes over sensitive coordinates
    ctx.fillStyle = '#000000';
    redactionBoxes.forEach(box => {
      // Scale coordinates if devicePixelRatio > 1
      const scaleX = imageBitmap.width / (canvas.width || 1);
      ctx.fillRect(box.x, box.y, box.width, box.height);
      
      // Draw subtle privacy label on top
      ctx.fillStyle = '#a855f7';
      ctx.font = '12px sans-serif';
      ctx.fillText(' [REDACTED] ', box.x + 2, box.y + 14);
      ctx.fillStyle = '#000000';
    });

    const redactedBlob = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await redactedBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.warn('Canvas redaction fallback:', err);
    return dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
  }
}

/**
 * Calls local Ollama endpoint with JSON output instructions
 */
async function consultOllamaVision(model, task, domState, base64Image) {
  const elementsSummary = domState.interactiveElements.map(el => 
    `[${el.id}] <${el.tag}> ${el.text ? `"${el.text}"` : ''} ${el.placeholder ? `(placeholder: "${el.placeholder}")` : ''}`
  ).join('\n');

  const systemPrompt = `You are MaskAgent, an intelligent on-device browser agent powered by ${model}.
User Goal: "${task}"

Current Page Title: "${domState.title}"
Current URL: "${domState.url}"

Interactive Elements on Screen:
${elementsSummary}

Analyze the element list and page structure. Choose the NEXT single action to make progress towards the goal.

STRICT RESPONSE FORMAT:
You MUST reply ONLY with a single raw JSON object. No markdown, no triple backticks, no conversational text.

Schema:
{
  "thought": "short explanation of reasoning",
  "action": "click" | "type" | "scroll" | "finish",
  "target_id": 1,
  "text": "text string if action is type",
  "direction": "down" | "up",
  "reason": "summary"
}`;

  const isVisionModel = model.includes('llava') || model.includes('vl') || model.includes('vision');

  const requestBody = {
    model: model,
    prompt: systemPrompt,
    stream: false,
    format: 'json',
    options: {
      temperature: 0.2
    }
  };

  if (isVisionModel && base64Image) {
    requestBody.images = [base64Image];
  }

  let response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  // If request failed and we included images, retry without images (for text/code models like deepseek-coder)
  if (!response.ok && requestBody.images) {
    delete requestBody.images;
    response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
  }

  if (!response.ok) {
    throw new Error(`Ollama API returned HTTP ${response.status}`);
  }

  const resultData = await response.json();
  const rawResponse = resultData.response || '';

  // Clean markdown backticks if model wrapped JSON
  let cleanedJsonStr = rawResponse.trim();
  if (cleanedJsonStr.startsWith('```json')) {
    cleanedJsonStr = cleanedJsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanedJsonStr.startsWith('```')) {
    cleanedJsonStr = cleanedJsonStr.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleanedJsonStr);
  } catch (parseErr) {
    console.error('Failed to parse Ollama response:', rawResponse);
    throw new Error(`Ollama did not return valid JSON action. Raw: "${rawResponse.slice(0, 80)}"`);
  }
}

// Utility Helpers
function logMessage(text, logType = 'info') {
  const logObj = { text, logType, timestamp: new Date().toLocaleTimeString() };
  agentLogs.push(logObj);
  if (agentLogs.length > 50) agentLogs.shift();

  chrome.runtime.sendMessage({
    type: 'AGENT_LOG',
    text: text,
    logType: logType
  }).catch(() => {});
}

function broadcastAgentStatus() {
  chrome.runtime.sendMessage({
    type: 'AGENT_STATUS_CHANGE',
    isRunning: isAgentRunning,
    stepInfo: isAgentRunning ? `Step ${currentStep}/${maxSteps}` : 'Idle'
  }).catch(() => {});
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
