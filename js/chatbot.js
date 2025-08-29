console.log("Chatbot JS loaded ✅");

// Elements
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const closeChatbot = document.getElementById("closeChatbot");
const sendChatbot = document.getElementById("sendChatbot");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");

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

  // Dummy bot reply
  setTimeout(() => {
    typingText.textContent = "I'm just a dummy bot for now!";
    scrollToBottom();
  }, 800);
}

sendChatbot.addEventListener("click", sendMessage);
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});