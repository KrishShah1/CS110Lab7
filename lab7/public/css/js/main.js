document.addEventListener('DOMContentLoaded', () => {
    const roomName = window.location.pathname.substring(1);
    const messagesContainer = document.getElementById('messages');
  
    // Function to fetch and display messages
    async function fetchMessages() {
      const response = await fetch(`/${roomName}/messages`);
      const messages = await response.json();
      messagesContainer.innerHTML = '';
      messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.nickname}: ${msg.body} (${msg.datetime})`;
        messagesContainer.appendChild(messageElement);
      });
    }
  
    // Function to post a new message
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
  
    // Set up an interval to refresh messages
    setInterval(fetchMessages, 3000);
  
    // Set up event listener for the form
    document.getElementById('message-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const nickname = prompt('Enter your nickname:');
      const body = event.target.elements.message.value;
      postMessage(nickname, body);
      event.target.reset();
    });
  
    fetchMessages();
  });
  