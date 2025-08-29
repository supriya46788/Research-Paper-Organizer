console.log("Chatbot JS loaded ✅");
console.log("Toggle:", document.getElementById("chatbot-toggle"));
console.log("Container:", document.getElementById("chatbot-container"));
// Elements
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const closeChatbot = document.getElementById("closeChatbot");
const sendChatbot = document.getElementById("sendChatbot");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");

// Keys
const CURRENT_USER_KEY = "current_user";
localStorage.setItem("current_user", JSON.stringify({ name: "testuser" }));
// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

// Get initials for avatar
function getUserInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");
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

  // User message with avatar
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "message user-message";

  const userAvatar = document.createElement("div");
  userAvatar.className = "avatar user-avatar";
  userAvatar.textContent = getUserInitials(currentUser?.name);

  const userText = document.createElement("div");
  userText.className = "text";
  userText.textContent = userMessage;

  userMsgEl.appendChild(userAvatar);
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