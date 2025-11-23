const BASE_URL = import.meta.env.VITE_API_URL;

async function getAvailableModels() {
  const res = await fetch(`https://apichat.bryanquintana.com/api/v1/models/available/`, {
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

  const res = await fetch(`https://apichat.bryanquintana.com` + `/api/v1/chat/`, {
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
  const res = await fetch(`https://apichat.bryanquintana.com/api/v1/report/`, {
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