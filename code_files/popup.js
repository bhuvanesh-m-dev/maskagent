// MaskAgent Popup Controller
document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  const ollamaOfflineView = document.getElementById('ollamaOfflineView');
  const modelPullView = document.getElementById('modelPullView');
  const mainAgentView = document.getElementById('mainAgentView');
  
  const btnRetryOllama = document.getElementById('btnRetryOllama');
  const pullModelName = document.getElementById('pullModelName');
  const pullPercent = document.getElementById('pullPercent');
  const pullStatusText = document.getElementById('pullStatusText');
  const pullProgressFill = document.getElementById('pullProgressFill');
  
  const modelSelect = document.getElementById('modelSelect');
  const maxStepsSelect = document.getElementById('maxStepsSelect');
  const toggleRedaction = document.getElementById('toggleRedaction');
  const taskInput = document.getElementById('taskInput');
  const btnStartAgent = document.getElementById('btnStartAgent');
  const btnStopAgent = document.getElementById('btnStopAgent');
  const stepCounter = document.getElementById('stepCounter');
  const logContent = document.getElementById('logContent');

  // Load saved preferences
  chrome.storage.local.get(['selectedModel', 'maxSteps', 'enableRedaction', 'lastTask'], (res) => {
    if (res.selectedModel) modelSelect.value = res.selectedModel;
    if (res.maxSteps) maxStepsSelect.value = res.maxSteps;
    if (typeof res.enableRedaction === 'boolean') toggleRedaction.checked = res.enableRedaction;
    if (res.lastTask) taskInput.value = res.lastTask;
  });

  // Event Listeners for settings
  modelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedModel: modelSelect.value });
    checkOllamaAndModel();
  });
  maxStepsSelect.addEventListener('change', () => {
    chrome.storage.local.set({ maxSteps: maxStepsSelect.value });
  });
  toggleRedaction.addEventListener('change', () => {
    chrome.storage.local.set({ enableRedaction: toggleRedaction.checked });
  });
  taskInput.addEventListener('input', () => {
    chrome.storage.local.set({ lastTask: taskInput.value });
  });

  btnRetryOllama.addEventListener('click', () => {
    updateStatus('busy', 'Checking Ollama...');
    checkOllamaAndModel();
  });

  btnStartAgent.addEventListener('click', startAgent);
  btnStopAgent.addEventListener('click', stopAgent);

  // Listen for messages from background (logs, status, pull progress)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PULL_PROGRESS') {
      handlePullProgress(message);
    } else if (message.type === 'AGENT_LOG') {
      appendLog(message.text, message.logType);
    } else if (message.type === 'AGENT_STATUS_CHANGE') {
      updateAgentRunState(message.isRunning, message.stepInfo);
    }
  });

  // Initial check on popup launch
  checkOllamaAndModel();

  // Functions
  function updateStatus(state, label) {
    statusDot.className = 'status-dot ' + state;
    statusText.textContent = label;
  }

  function showView(viewName) {
    ollamaOfflineView.classList.add('hidden');
    modelPullView.classList.add('hidden');
    mainAgentView.classList.add('hidden');

    if (viewName === 'offline') ollamaOfflineView.classList.remove('hidden');
    else if (viewName === 'pull') modelPullView.classList.remove('hidden');
    else if (viewName === 'main') mainAgentView.classList.remove('hidden');
  }

  async function checkOllamaAndModel() {
    updateStatus('busy', 'Checking...');
    const targetModel = modelSelect.value;

    chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA_STATUS', model: targetModel }, (response) => {
      if (chrome.runtime.lastError || !response) {
        updateStatus('offline', 'Ollama Missing');
        showView('offline');
        return;
      }

      if (!response.ollamaRunning) {
        updateStatus('offline', 'Ollama Offline');
        showView('offline');
        return;
      }

      if (!response.modelAvailable) {
        updateStatus('busy', 'Pulling Model');
        showView('pull');
        pullModelName.textContent = `Setting up ${targetModel}...`;
        // Trigger auto pull in background service worker
        chrome.runtime.sendMessage({ type: 'PULL_MODEL', model: targetModel });
        return;
      }

      // Ollama is running AND model is available!
      updateStatus('online', 'Ready');
      showView('main');
      checkAgentRunningStatus();
    });
  }

  function handlePullProgress(data) {
    showView('pull');
    updateStatus('busy', 'Downloading');
    pullModelName.textContent = `Setting up ${data.model}...`;
    pullStatusText.textContent = data.status || 'Downloading layers...';
    
    if (data.total && data.completed) {
      const pct = Math.round((data.completed / data.total) * 100);
      pullPercent.textContent = `${pct}%`;
      pullProgressFill.style.width = `${pct}%`;
    } else {
      pullPercent.textContent = data.percent ? `${data.percent}%` : '...';
      pullProgressFill.style.width = data.percent ? `${data.percent}%` : '50%';
    }

    if (data.done) {
      updateStatus('online', 'Ready');
      showView('main');
      appendLog(`Model ${data.model} ready for local inference.`, 'success');
    }
  }

  function appendLog(text, type = 'info') {
    const item = document.createElement('div');
    item.className = `log-item ${type}`;
    item.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    logContent.appendChild(item);
    logContent.scrollTop = logContent.scrollHeight;
  }

  function checkAgentRunningStatus() {
    chrome.runtime.sendMessage({ type: 'GET_AGENT_STATUS' }, (res) => {
      if (res) {
        updateAgentRunState(res.isRunning, res.stepInfo);
        if (res.logs && res.logs.length > 0) {
          logContent.innerHTML = '';
          res.logs.forEach(l => appendLog(l.text, l.type));
        }
      }
    });
  }

  function updateAgentRunState(isRunning, stepInfo) {
    if (isRunning) {
      btnStartAgent.classList.add('hidden');
      btnStopAgent.classList.remove('hidden');
      taskInput.disabled = true;
      stepCounter.textContent = stepInfo || 'Running...';
      updateStatus('busy', 'Executing');
    } else {
      btnStartAgent.classList.remove('hidden');
      btnStopAgent.classList.add('hidden');
      taskInput.disabled = false;
      stepCounter.textContent = 'Idle';
      updateStatus('online', 'Ready');
    }
  }

  function startAgent() {
    const task = taskInput.value.trim();
    if (!task) {
      appendLog('Please enter a task description for MaskAgent.', 'warning');
      return;
    }

    const config = {
      task: task,
      model: modelSelect.value,
      maxSteps: parseInt(maxStepsSelect.value, 10),
      enableRedaction: toggleRedaction.checked
    };

    logContent.innerHTML = '';
    appendLog(`Starting MaskAgent task: "${task}"`, 'info');
    if (config.enableRedaction) {
      appendLog(`Privacy Redaction: ON (DOM + Image PII Masking)`, 'privacy');
    }

    chrome.runtime.sendMessage({ type: 'START_AGENT_TASK', config: config });
    updateAgentRunState(true, `Step 1/${config.maxSteps}`);
  }

  function stopAgent() {
    chrome.runtime.sendMessage({ type: 'STOP_AGENT_TASK' });
    appendLog('Execution cancelled by user.', 'warning');
    updateAgentRunState(false);
  }
});
