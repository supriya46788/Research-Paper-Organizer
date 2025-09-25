// Modern Floating Chatbot Widget - Research Paper Organizer
class FloatingChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        
        // Research-focused knowledge base
        this.knowledgeBase = {
            greetings: [
                "Hello! I'm your Research Assistant 📚 How can I help you organize your research today?",
                "Hi there! Ready to streamline your research workflow? What do you need help with?",
                "Welcome! I'm here to help with research papers, citations, and organization. What's on your mind?",
                "Hey! Your research assistant is here 🎓 Ask me anything about paper management!"
            ],
            goodbyes: [
                "Happy researching! Keep your papers organized! 📖",
                "See you later! May your research be productive! 🎯",
                "Goodbye! Don't hesitate to ask if you need more help organizing your research! 📝",
                "Take care! Come back anytime for research assistance! 🔬"
            ],
            research_types: {
                "journal article": "Journal articles are peer-reviewed research publications. Organize them by impact factor, subject area, or research methodology for easy access.",
                "conference paper": "Conference papers present research at academic conferences. Sort them by conference name, year, or research field to track developments.",
                "thesis": "Thesis and dissertations are comprehensive research documents. Organize supporting literature and references systematically.",
                "review paper": "Review papers summarize existing research on topics. Perfect for understanding current research landscapes in your field.",
                "case study": "Case studies provide in-depth analysis of specific instances. Valuable for qualitative research and real-world applications."
            },
            organization_tips: [
                "📁 Create topic-based folders: 'Machine Learning', 'Climate Change', 'Psychology' etc.",
                "👤 Sort by author names when following specific researchers or building citation networks.",
                "📅 Use chronological organization to track research evolution and find latest publications.",
                "📖 Group by journal/venue to identify top publications and track quality sources.",
                "🔬 Organize by methodology: quantitative, qualitative, experimental, theoretical approaches.",
                "⭐ Use priority tags: 'Must Read', 'Important', 'Reference Only' based on relevance."
            ],
            research_tips: [
                "📝 Take structured notes with key findings, methodology, and your personal insights.",
                "🏷️ Use descriptive tags for cross-referencing papers across multiple categories.",
                "💾 Always backup your research database using cloud storage and regular exports.",
                "🔍 Master Boolean search operators (AND, OR, NOT) for efficient paper discovery.",
                "📚 Try the SQ3R method: Survey, Question, Read, Recite, Review for effective reading.",
                "🔗 Use citation managers like Zotero, Mendeley, or EndNote for automatic formatting."
            ],
            website_features: [
                "🗂️ Our platform offers comprehensive paper categorization and tagging systems.",
                "🔍 Advanced search functionality helps you find papers by title, author, keywords, or content.",
                "📋 Citation management with export options for APA, MLA, Chicago, and IEEE formats.",
                "📊 Track your reading progress and maintain organized to-read lists.",
                "☁️ Cloud synchronization keeps your research accessible from anywhere.",
                "📱 Mobile-responsive design for research on the go."
            ]
        };
        
        this.init();
    }
    
    init() {
        console.log('🤖 Initializing Floating Research Chatbot...');
        this.createChatbotWidget();
        this.bindEvents();
        console.log('✅ Research Chatbot ready!');
    }
    
    createChatbotWidget() {
        // Create floating chatbot widget
        const chatbotHTML = `
            <div class="chatbot-widget" id="chatbotWidget">
                <button class="chatbot-toggle" id="chatbotToggle" title="Chat with Research Assistant">
                    <i class="fas fa-comments" id="chatbotIcon"></i>
                </button>
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <div class="chatbot-status"></div>
                            <span>Research Assistant</span>
                        </div>
                        <button class="chatbot-close" id="chatbotClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="chatbot-message bot">
                            Hello! I'm your Research Assistant 📚 I can help you with paper organization, citations, and research tips. What would you like to know?
                        </div>
                    </div>
                    <div class="chatbot-input-area">
                        <input type="text" class="chatbot-input" id="chatbotInput" 
                               placeholder="Ask about research organization..." 
                               maxlength="300" autocomplete="off">
                        <button class="chatbot-send" id="chatbotSend" title="Send message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body if not exists
        if (!document.getElementById('chatbotWidget')) {
            document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        }
    }
    
    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const window = document.getElementById('chatbotWindow');
        
        if (!toggle || !close || !send || !input) {
            console.error('❌ Chatbot elements not found');
            return;
        }
        
        // Toggle chatbot
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChatbot();
        });
        
        // Close chatbot
        close.addEventListener('click', () => this.closeChatbot());
        
        // Send message
        send.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && window && !window.contains(e.target) && !toggle.contains(e.target)) {
                this.closeChatbot();
            }
        });
        
        // Prevent window clicks from closing
        window.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Auto-resize input
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });
    }
    
    toggleChatbot() {
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');
        const icon = document.getElementById('chatbotIcon');
        
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            window.classList.add('show');
            toggle.classList.add('open');
            icon.className = 'fas fa-times';
            this.isOpen = true;
            
            // Focus input after animation
            setTimeout(() => {
                document.getElementById('chatbotInput').focus();
            }, 300);
        }
    }
    
    closeChatbot() {
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');
        const icon = document.getElementById('chatbotIcon');
        
        window.classList.remove('show');
        toggle.classList.remove('open');
        icon.className = 'fas fa-comments';
        this.isOpen = false;
    }
    
    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response with realistic delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 800 + Math.random() * 1200);
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.textContent = text;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    showTypingIndicator() {
        if (this.isTyping) return;
        
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.isTyping = true;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Greetings
        if (this.containsAny(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start'])) {
            return this.getRandomResponse(this.knowledgeBase.greetings);
        }
        
        // Goodbyes
        if (this.containsAny(lowerMessage, ['bye', 'goodbye', 'see you', 'farewell', 'thanks', 'thank you', 'close'])) {
            return this.getRandomResponse(this.knowledgeBase.goodbyes);
        }
        
        // Research paper types
        if (this.containsAny(lowerMessage, ['journal', 'conference', 'thesis', 'review', 'case study', 'paper type'])) {
            for (const [paperType, info] of Object.entries(this.knowledgeBase.research_types)) {
                if (lowerMessage.includes(paperType.replace(' ', ''))) {
                    return info;
                }
            }
            return "I can help you understand different research paper types: journal articles, conference papers, thesis, review papers, and case studies. Which one interests you?";
        }
        
        // Organization methods
        if (this.containsAny(lowerMessage, ['organize', 'organization', 'categorize', 'sort', 'arrange', 'manage', 'folder'])) {
            return this.getRandomResponse(this.knowledgeBase.organization_tips);
        }
        
        // Research tips
        if (this.containsAny(lowerMessage, ['tip', 'advice', 'how to', 'citation', 'note', 'tag', 'backup', 'search', 'read', 'productivity'])) {
            return this.getRandomResponse(this.knowledgeBase.research_tips);
        }
        
        // Website features
        if (this.containsAny(lowerMessage, ['website', 'site', 'platform', 'feature', 'what can', 'help', 'tool'])) {
            return this.getRandomResponse(this.knowledgeBase.website_features);
        }
        
        // Default helpful responses
        const defaultResponses = [
            "I'm here to help with research organization! Ask me about paper types, organization methods, or research productivity tips.",
            "I can assist with organizing papers, citation management, or research workflow optimization. What specific area interests you?",
            "Feel free to ask about academic paper management, research tips, or how to use our platform effectively!",
            "I specialize in research organization! Try asking about paper categorization, citation formats, or productivity strategies."
        ];
        
        return this.getRandomResponse(defaultResponses);
    }
    
    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize floating chatbot
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        try {
            if (!document.getElementById('chatbotWidget')) {
                new FloatingChatbot();
            }
        } catch (error) {
            console.error('❌ Error initializing chatbot:', error);
        }
    }, 1000);
});

// Fallback initialization
if (document.readyState !== 'loading') {
    setTimeout(() => {
        try {
            if (!document.getElementById('chatbotWidget')) {
                new FloatingChatbot();
            }
        } catch (error) {
            console.error('❌ Fallback chatbot init error:', error);
        }
    }, 1500);
}
