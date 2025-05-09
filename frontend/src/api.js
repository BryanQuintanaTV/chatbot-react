const BASE_URL = import.meta.env.VITE_API_URL;

async function sendChatMessage(chatId, message) {
  const res = await fetch(`https://apichat.bryanquintana.com` + `/api/v1/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  if (!res.ok) {
    console.error(data)
    return Promise.reject({ status: res.status, data: await res.json() });
  }
  return res.body;
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
  sendReport
};