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

// Simple Q&A responses
setTimeout(() => {
  const lower = userMessage.toLowerCase();
  let answer = null;

  if (/(add|upload).*paper/.test(lower)) {
    answer = "Go to 'Add Your Papers' from the How it Works steps or open add-organize-papers.html to upload PDFs and enter details.";
  } else if (/(tag|organize|label)/.test(lower)) {
    answer = "Use topics, tags, and custom labels on your paper details. Then search or filter by those tags from your library.";
  } else if (/(sync|cloud)/.test(lower)) {
    answer = "Enable Cloud Sync from Tools or use the Cloud Sync feature to access your library from anywhere.";
  } else if (/(cite|citation|apa|mla|chicago)/.test(lower)) {
    answer = "Use the Auto Citation feature to generate APA, MLA, or Chicago citations with one click on a paper.";
  } else if (/(search|find).*paper/.test(lower)) {
    answer = "Try Smart Search from the homepage; it searches across titles, authors, abstracts, and tags.";
  } else if (/(login|signup|account)/.test(lower)) {
    answer = "Create an account via signup.html or login through login.html to access your saved library.";
  }

  typingText.textContent = answer || "I’ll help with general guidance here. For advanced answers, connect me to your backend API.";
  scrollToBottom();
}, 600);
}

sendChatbot.addEventListener("click", sendMessage);
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Handle suggestion clicks
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".suggestion");
  if (!btn) return;
  const q = btn.getAttribute("data-question") || btn.textContent;
  chatbotInput.value = q;
  sendMessage();
});