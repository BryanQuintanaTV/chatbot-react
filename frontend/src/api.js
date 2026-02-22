const BASE_URL = import.meta.env.VITE_API_URL;
// Derive the /api/v1 base by stripping the trailing '/chat' segment
const API_V1_BASE = BASE_URL ? BASE_URL.replace(/\/chat\/?$/, '') : '';

async function getAvailableModels() {
  const res = await fetch(`${API_V1_BASE}/models/available/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return Promise.reject({ status: res.status, data: await res.json() });
  }
  return await res.json();
}

async function sendChatMessage(chatId, message, model = 'auto', token = null) {
  const headers = { 'Content-Type': 'application/json' };

  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Include conversationId in request body if provided
  const body = { message, model };
  if (chatId) {
    body.conversationId = chatId;
  }

  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    return Promise.reject({ status: res.status, data: await res.json() });
  }

  // Get the model that was actually used from response headers
  const modelUsed = res.headers.get('X-Model-Used') || 'unknown';

  return { stream: res.body, modelUsed };
}

async function sendReport(data) {
  const res = await fetch(`${API_V1_BASE}/report/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    return Promise.reject({ status: res.status, data: await res.json() });
  }
  return await res.json();
}

export default {
  sendChatMessage,
  sendReport,
  getAvailableModels
};