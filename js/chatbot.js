console.log("Chatbot JS loaded ✅");

// Elements
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const closeChatbot = document.getElementById("closeChatbot");
const sendChatbot = document.getElementById("sendChatbot");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");

// Preset FAQ for this site
const FAQ = [
  { q: 'How do I add a paper?', a: 'Go to “Add & Organize Papers”, upload your PDF, enter title/author, and add tags for quick filtering.' },
  { q: 'Where is Add & Organize?', a: 'Use the navbar or open add-organize-papers.html. It lets you upload, tag, and categorize papers.' },
  { q: 'How do I search?', a: 'Use the search on the home page or filters by title, author, tag; results update instantly as you type.' },
  { q: 'How do tags work?', a: 'While saving a paper, add one or more tags like ML, CV, Theory. Later filter by tags to find papers fast.' },
  { q: 'Can I edit or delete a paper?', a: 'Open the paper card and use Edit to update details or Delete to remove it from your list.' },
  { q: 'Dark mode?', a: 'Toggle the moon icon in the navbar to switch dark mode for a better reading experience.' },
  { q: 'Where is login/signup?', a: 'Use Get Started to create an account or Login from the navbar to access saved papers across sessions.' },
  { q: 'How to organize by status?', a: 'Mark papers as To Read, Reading, or Read in the details; then filter or sort by status.' }
];

// Render quick question chips
const quick = document.getElementById('chatbotQuick');
if (quick) {
  FAQ.forEach(item => {
    const b = document.createElement('button');
    b.className = 'chatbot-chip';
    b.textContent = item.q;
    b.addEventListener('click', () => handleQuestion(item.q, item.a));
    quick.appendChild(b);
  });
}
function botReply(text){
  const typingEl = document.createElement('div');
  typingEl.className = 'message bot-message';
  const avatar = document.createElement('div');
  avatar.className = 'avatar bot-avatar';
  avatar.textContent = '🤖';
  const t = document.createElement('div');
  t.className = 'text';
  t.textContent = 'Typing…';
  typingEl.appendChild(avatar); typingEl.appendChild(t);
  chatbotMessages.appendChild(typingEl);
  scrollToBottom();
  setTimeout(()=>{ t.textContent = text; scrollToBottom(); }, 450);
}

function handleQuestion(q, a){
  // Show user question bubble
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'message user-message';
  const userText = document.createElement('div');
  userText.className = 'text';
  userText.textContent = q;
  userMsgEl.appendChild(userText);
  chatbotMessages.appendChild(userMsgEl);
  scrollToBottom();

  // Show bot answer
  botReply(a);
}


// Scroll helper
function scrollToBottom() {
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Toggle open/close
chatbotToggle.addEventListener("click", () => {
  chatbotContainer.classList.toggle("hidden");
  chatbotContainer.classList.toggle("open");
  chatbotToggle.classList.toggle("shifted");
});

closeChatbot.addEventListener("click", () => {
  chatbotContainer.classList.add("hidden");
  chatbotContainer.classList.remove("open");
  chatbotToggle.classList.remove("shifted");
});

// Send message
function sendMessage() {
  const userMessage = chatbotInput.value.trim();
  if (!userMessage) return;

  // User message
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "message user-message";

  const userText = document.createElement("div");
  userText.className = "text";
  userText.textContent = userMessage;

  userMsgEl.appendChild(userText);
  chatbotMessages.appendChild(userMsgEl);

  chatbotInput.value = "";
  scrollToBottom();

  // Typing indicator
  const typingEl = document.createElement("div");
  typingEl.className = "message bot-message";

  const botAvatar = document.createElement("div");
  botAvatar.className = "avatar bot-avatar";
  botAvatar.textContent = "🤖";

  const typingText = document.createElement("div");
  typingText.className = "text";
  typingText.textContent = "Typing...";

  typingEl.appendChild(botAvatar);
  typingEl.appendChild(typingText);
  chatbotMessages.appendChild(typingEl);
  scrollToBottom();

  // Respond using preset FAQ instead of dummy text
setTimeout(() => {
  const t = userMessage.toLowerCase();

  // Try to match a preset FAQ item
  const found = FAQ.find(item =>
    t.includes(item.q.toLowerCase().split('?')[0]) ||
    t.includes(item.q.toLowerCase().split(' ')[0])
  );

  if (found) {
    typingText.textContent = found.a;
  } else if (t.includes('add') && t.includes('paper')) {
    typingText.textContent = 'Go to “Add & Organize Papers”, upload your PDF, add title/author, and tags.';
  } else if (t.includes('search')) {
    typingText.textContent = 'Use the search bar to filter by title, author, or tags; results update instantly.';
  } else if (t.includes('tag')) {
    typingText.textContent = 'Add tags while saving a paper; later filter by those tags to find papers fast.';
  } else if (t.includes('login') || t.includes('signup') || t.includes('sign up') || t.includes('get started')) {
    typingText.textContent = 'Use Get Started to create an account or the Login link in the navbar.';
  } else if (t.includes('status') || t.includes('read') || t.includes('reading')) {
    typingText.textContent = 'Mark papers as To Read, Reading, or Read; then filter by status.';
  } else {
    typingText.textContent = 'Choose a question above or try: "How do I add a paper?", "How do I search?", "How do tags work?".';
  }

  scrollToBottom();
}, 450);

}

sendChatbot.addEventListener("click", sendMessage);
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});


(() => {
  const overlay = document.getElementById('chatbot-container') || document.getElementById('chatbotOverlay');
  const panel = document.querySelector('.chatbot-panel');
  const handle = document.querySelector('.chatbot-header');

  if (!overlay || !panel || !handle) return;

  let startX = 0, startY = 0, origX = 0, origY = 0, dragging = false;

  function onDown(e){
    dragging = true;
    const rect = panel.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startY = (e.touches ? e.touches[0].clientY : e.clientY);
    panel.style.position = 'fixed';
    panel.style.margin = '0';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('touchend', onUp);
  }

  function onMove(e){
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = x - startX;
    const dy = y - startY;
    panel.style.left = `${origX + dx}px`;
    panel.style.top  = `${origY + dy}px`;
  }

  function onUp(){
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }

  handle.addEventListener('mousedown', onDown);
  handle.addEventListener('touchstart', onDown, {passive:true});
})();
