// AI Assistant - Gemini API Integration & Features
class AIAssistant {
  constructor() {
    this.currentPaper = null;
    this.currentSummary = '';
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.charts = {};
  }

  // Initialize the AI Assistant with a selected paper
  init(paper) {
    this.currentPaper = paper;
    this.showInterface();
  }

  // Show the AI interface directly (no API key setup needed)
  showInterface() {
    const modal = document.getElementById('aiSummarizerModal');
    const apiKeySetup = document.getElementById('apiKeySetup');
    const aiInterface = document.getElementById('aiInterface');
    
    modal.classList.remove('hidden');
    
    // Always show the AI interface (server handles API key)
    apiKeySetup.classList.add('hidden');
    aiInterface.classList.remove('hidden');
  }

  // API Key Management
  async saveApiKey() {
    const keyInput = document.getElementById('apiKeyInput');
    const key = keyInput.value.trim();
    
    if (!key) {
      Swal.fire('Error', 'Please enter a valid API key', 'error');
      return;
    }
    
    // Test the API key
    try {
      const response = await this.testApiKey(key);
      if (response.ok) {
        ApiKeyManager.setApiKey(key);
        keyInput.value = '';
        this.showInterface();
        Swal.fire('Success', 'API key saved successfully!', 'success');
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      Swal.fire('Error', 'Invalid API key. Please check and try again.', 'error');
    }
  }

  // Test API key validity
  async testApiKey(apiKey) {
    const testPrompt = "Hello, just testing the API connection.";
    return await fetch(`${CONFIG.gemini.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }]
      })
    });
  }

  // Generate AI Summary
  async generateSummary(type) {
    if (!this.currentPaper) {
      Swal.fire('Error', 'No paper selected', 'error');
      return;
    }

    const loadingEl = document.getElementById('aiLoading');
    const summaryContent = document.getElementById('summaryContent');
    const voiceControls = document.getElementById('voiceControls');
    
    loadingEl.classList.remove('hidden');
    
    try {
      const prompt = this.createSummaryPrompt(type);
      const response = await this.callGeminiAPI(prompt);
      
      if (response.candidates && response.candidates[0]) {
        const content = response.candidates[0].content.parts[0].text;
        this.currentSummary = content;
        
        summaryContent.innerHTML = `
          <div class="summary-result">
            <h4>${CONFIG.ai.summaryTypes[type]}</h4>
            <div class="summary-text">${this.formatSummaryText(content)}</div>
            <div class="summary-actions">
              <button onclick="aiAssistant.copySummary()" class="btn-copy">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        `;
        
        voiceControls.classList.remove('hidden');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      summaryContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate summary. Please try again.</p>
        </div>
      `;
    } finally {
      loadingEl.classList.add('hidden');
    }
  }

  // Create prompt for different summary types
  createSummaryPrompt(type) {
    const paper = this.currentPaper;
    const paperText = `
Title: ${paper.title}
Authors: ${paper.authors}
Abstract: ${paper.abstract || 'No abstract available'}
Notes: ${paper.notes || 'No notes available'}
Journal: ${paper.journal || 'Not specified'}
Year: ${paper.year || 'Not specified'}
Tags: ${paper.tags.join(', ')}
    `;

    const prompts = {
      tldr: `Provide a concise TL;DR summary (2-3 sentences) of this research paper: ${paperText}`,
      detailed: `Provide a detailed summary of this research paper, including methodology, findings, and implications: ${paperText}`,
      keypoints: `Extract and list the key points from this research paper in bullet format: ${paperText}`,
      questions: `Generate 5 relevant research questions that could be explored based on this paper: ${paperText}`
    };

    return prompts[type] || prompts.tldr;
  }

  // Call Gemini API via server
  async callGeminiAPI(prompt) {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Format response to match expected structure
    return {
      candidates: [{
        content: {
          parts: [{
            text: data.summary
          }]
        }
      }]
    };
  }

  // Format summary text (convert markdown-like formatting to HTML)
  formatSummaryText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>');
  }

  // Copy summary to clipboard
  copySummary() {
    if (this.currentSummary) {
      navigator.clipboard.writeText(this.currentSummary).then(() => {
        Swal.fire({
          title: 'Copied!',
          text: 'Summary copied to clipboard',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      });
    }
  }

  // Voice Assistant Features
  speakSummary() {
    if (!this.currentSummary) return;
    
    this.stopSpeaking();
    
    this.currentUtterance = new SpeechSynthesisUtterance(this.currentSummary);
    this.currentUtterance.rate = CONFIG.voice.rate;
    this.currentUtterance.pitch = CONFIG.voice.pitch;
    this.currentUtterance.lang = CONFIG.voice.language;
    
    this.speechSynthesis.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

  // Chart Generation
  async generateChart(type) {
    const container = document.getElementById('chartsContainer');
    const loadingEl = document.getElementById('aiLoading');
    
    loadingEl.classList.remove('hidden');
    
    try {
      let chartData;
      let chartConfig;
      
      switch (type) {
        case 'keywords':
          chartData = this.generateKeywordData();
          chartConfig = this.createBarChart('Keyword Frequency', chartData);
          break;
        case 'timeline':
          chartData = this.generateTimelineData();
          chartConfig = this.createLineChart('Research Timeline', chartData);
          break;
        case 'topics':
          chartData = this.generateTopicData();
          chartConfig = this.createPieChart('Topic Distribution', chartData);
          break;
      }
      
      this.renderChart(container, chartConfig, type);
      
    } catch (error) {
      console.error('Error generating chart:', error);
      container.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate chart. Please try again.</p>
        </div>
      `;
    } finally {
      loadingEl.classList.add('hidden');
    }
  }

  // Generate keyword frequency data
  generateKeywordData() {
    const text = `${this.currentPaper.title} ${this.currentPaper.abstract} ${this.currentPaper.notes}`.toLowerCase();
    const words = text.split(/\W+/).filter(word => word.length > 3);
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Get top 10 keywords
    const sortedKeywords = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    return {
      labels: sortedKeywords.map(([word]) => word),
      data: sortedKeywords.map(([,count]) => count)
    };
  }

  // Generate timeline data from all papers
  generateTimelineData() {
    const yearCounts = {};
    papers.forEach(paper => {
      const year = paper.year || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    const sortedYears = Object.entries(yearCounts)
      .sort(([a], [b]) => a - b);
    
    return {
      labels: sortedYears.map(([year]) => year),
      data: sortedYears.map(([,count]) => count)
    };
  }

  // Generate topic distribution data
  generateTopicData() {
    const topicCounts = {};
    papers.forEach(paper => {
      const topic = paper.topic || 'Uncategorized';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    return {
      labels: Object.keys(topicCounts),
      data: Object.values(topicCounts)
    };
  }

  // Chart creation helpers
  createBarChart(title, data) {
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: title,
          data: data.data,
          backgroundColor: CONFIG.visualization.colors.primary,
          borderColor: CONFIG.visualization.colors.dark,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }

  createLineChart(title, data) {
    return {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: title,
          data: data.data,
          borderColor: CONFIG.visualization.colors.secondary,
          backgroundColor: CONFIG.visualization.colors.secondary + '20',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }

  createPieChart(title, data) {
    const colors = [
      CONFIG.visualization.colors.primary,
      CONFIG.visualization.colors.secondary,
      CONFIG.visualization.colors.accent,
      CONFIG.visualization.colors.danger,
      CONFIG.visualization.colors.dark
    ];
    
    return {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: colors.slice(0, data.labels.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }

  // Render chart in container
  renderChart(container, config, type) {
    // Clear previous charts
    container.innerHTML = `
      <div class="chart-wrapper">
        <canvas id="chart-${type}" width="400" height="200"></canvas>
      </div>
    `;
    
    const canvas = container.querySelector(`#chart-${type}`);
    
    // Destroy existing chart if it exists
    if (this.charts[type]) {
      this.charts[type].destroy();
    }
    
    // Create new chart
    this.charts[type] = new Chart(canvas.getContext('2d'), config);
  }

  // Chat functionality
  async sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatHistory = document.getElementById('chatHistory');
    
    // Add user message
    this.addChatMessage(chatHistory, message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = this.addTypingIndicator(chatHistory);
    
    try {
      const prompt = this.createChatPrompt(message);
      const response = await this.callGeminiAPI(prompt);
      
      // Remove typing indicator
      document.getElementById(typingId).remove();
      
      if (response.candidates && response.candidates[0]) {
        const aiMessage = response.candidates[0].content.parts[0].text;
        this.addChatMessage(chatHistory, aiMessage, 'assistant');
      }
    } catch (error) {
      document.getElementById(typingId).remove();
      this.addChatMessage(chatHistory, 'Sorry, I encountered an error. Please try again.', 'assistant');
    }
  }

  // Create chat prompt with paper context
  createChatPrompt(userMessage) {
    const paper = this.currentPaper;
    const context = `
You are a research assistant helping with this paper:
Title: ${paper.title}
Authors: ${paper.authors}
Abstract: ${paper.abstract || 'No abstract available'}
Year: ${paper.year || 'Not specified'}

User question: ${userMessage}

Please provide a helpful response based on the paper context.
    `;
    
    return context;
  }

  // Add chat message to history
  addChatMessage(container, message, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}-message`;
    
    const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    messageEl.innerHTML = `
      <i class="${icon}"></i>
      <div class="message-content">
        <p>${this.formatSummaryText(message)}</p>
      </div>
    `;
    
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
    
    return messageEl.id;
  }

  // Add typing indicator
  addTypingIndicator(container) {
    const typingEl = document.createElement('div');
    const id = 'typing-' + Date.now();
    typingEl.id = id;
    typingEl.className = 'chat-message assistant-message typing';
    typingEl.innerHTML = `
      <i class="fas fa-robot"></i>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
    
    return id;
  }
}

// Global functions called by HTML
let aiAssistant = new AIAssistant();

function openAiSummarizer() {
  if (!selectedPaper) {
    Swal.fire('Error', 'Please select a paper first', 'error');
    return;
  }
  aiAssistant.init(selectedPaper);
}

function closeAiSummarizer() {
  document.getElementById('aiSummarizerModal').classList.add('hidden');
  aiAssistant.stopSpeaking();
}

function saveApiKey() {
  aiAssistant.saveApiKey();
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

function generateSummary(type) {
  aiAssistant.generateSummary(type);
}

function speakSummary() {
  aiAssistant.speakSummary();
}

function stopSpeaking() {
  aiAssistant.stopSpeaking();
}

function generateChart(type) {
  aiAssistant.generateChart(type);
}

function sendChatMessage() {
  aiAssistant.sendChatMessage();
}

// Handle Enter key in chat input
document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
});
