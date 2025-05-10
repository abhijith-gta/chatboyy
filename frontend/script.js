const socket = io();
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const skipBtn = document.getElementById('skipBtn');
const newChatBtn = document.getElementById('newChatBtn');
const typing = document.getElementById('typing');
const onlineCounter = document.getElementById('onlineCounter');

// Initial system message
appendMessage('', 'Searching for a partner...', 'system');

// Append message to chat
function appendMessage(name, msg, type = 'received') {
  const div = document.createElement('div');
  div.classList.add('message');

  if (type === 'sent') {
    div.classList.add('right');
    div.textContent = msg;
  } else if (type === 'system') {
    div.classList.add('system');
    div.textContent = msg;
  } else {
    div.classList.add('left');
    div.textContent = `${name}: ${msg}`;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Handle incoming messages
socket.on('message', (data) => {
  const msgType = data.name === 'System' ? 'system' : 'received';
  appendMessage(data.name, data.message, msgType);
});

// Send message
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (msg) {
    appendMessage('You', msg, 'sent');
    socket.emit('message', msg);
    messageInput.value = '';
    socket.emit('typing', false);
  }
});

// Send message when Enter is pressed
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevents the default behavior (new line or form submission)
    sendBtn.click(); // Trigger the Send button
  }
});

// Typing detection
messageInput.addEventListener('input', () => {
  socket.emit('typing', true);
});

messageInput.addEventListener('blur', () => {
  socket.emit('typing', false);
});

// Show typing indicator
socket.on('typing', () => {
  typing.textContent = 'Stranger is typing...';
  clearTimeout(typing.timeout);
  typing.timeout = setTimeout(() => {
    typing.textContent = '';
  }, 2000);
});

// Skip chat
skipBtn.addEventListener('click', () => {
  socket.emit('skip');
  chat.innerHTML = '';
  appendMessage('', 'Searching for a new partner...', 'system');
});

// New chat
newChatBtn.addEventListener('click', () => {
  location.reload();
});

// Update online count
socket.on('onlineCount', (count) => {
  onlineCounter.textContent = `Users online: ${count}`;
});
