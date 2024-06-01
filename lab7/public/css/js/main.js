document.addEventListener('DOMContentLoaded', () => {
  const roomName = window.location.pathname.substring(1);
  const messagesContainer = document.getElementById('messages');

  async function fetchMessages() {
    const response = await fetch(`/${roomName}/messages`);
    const messages = await response.json();
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `<strong>${msg.nickname}</strong>: ${msg.body} <em>(${msg.datetime})</em>`;
      messagesContainer.appendChild(messageElement);
    });
  }

  async function postMessage(nickname, body) {
    await fetch(`/${roomName}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nickname, body, datetime: new Date().toISOString() })
    });
    fetchMessages();
  }

  setInterval(fetchMessages, 3000);

  document.getElementById('message-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const nickname = event.target.elements.nickname.value;
    const body = event.target.elements.message.value;
    postMessage(nickname, body);
    event.target.reset();
  });

  fetchMessages();
});
