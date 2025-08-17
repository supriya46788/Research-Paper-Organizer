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

  // Show the AI interface (check if server is available)
  async showInterface() {
    const modal = document.getElementById('aiSummarizerModal');
    const apiKeySetup = document.getElementById('apiKeySetup');
    const aiInterface = document.getElementById('aiInterface');
    
    modal.classList.remove('hidden');
    
    // Check if server is running
    const hasServer = await this.checkServerAvailability();
    
    if (hasServer) {
      // Server is available - no API key needed
      apiKeySetup.classList.add('hidden');
      aiInterface.classList.remove('hidden');
    } else {
      // No server - check if user has API key for client-side mode
      if (ApiKeyManager.hasApiKey()) {
        apiKeySetup.classList.add('hidden');
        aiInterface.classList.remove('hidden');
      } else {
        apiKeySetup.classList.remove('hidden');
        aiInterface.classList.add('hidden');
      }
    }
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

  // Check if server is available
  async checkServerAvailability() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Call Gemini API (hybrid: server-side or client-side)
  async callGeminiAPI(prompt) {
    const hasServer = await this.checkServerAvailability();
    
    if (hasServer) {
      // Use server-side API
      return this.callServerAPI(prompt);
    } else {
      // Use client-side API
      return this.callClientAPI(prompt);
    }
  }

  // Call server-side API
  async callServerAPI(prompt) {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(error.error || `Server request failed: ${response.status}`);
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

  // Call client-side API (direct to Gemini)
  async callClientAPI(prompt) {
    const apiKey = ApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error('No API key available. Please set up your Gemini API key.');
    }

    const response = await fetch(`${CONFIG.gemini.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: CONFIG.ai.temperature,
          maxOutputTokens: CONFIG.ai.maxTokens,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
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
Tags: ${paper.tags ? paper.tags.join(', ') : 'No tags'}
    `;

    const prompts = {
      tldr: `Provide a concise TL;DR summary (2-3 sentences) of this research paper: ${paperText}`,
      detailed: `Provide a detailed summary of this research paper, including methodology, findings, and implications: ${paperText}`,
      keypoints: `Extract and list the key points from this research paper in bullet format: ${paperText}`,
      questions: `Generate 5 relevant research questions that could be explored based on this paper: ${paperText}`
    };

    return prompts[type] || prompts.tldr;
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
}

// Global functions called by HTML
let aiAssistant = new AIAssistant();

function openAiSummarizer() {
  // Get the selected paper from the existing organizer system
  const selectedPaper = getSelectedPaper();
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

// Helper function to get selected paper from the organizer
function getSelectedPaper() {
  // This function should be implemented to get the currently selected paper
  // from the existing organizer system. For now, return null if no paper is selected
  
  // Check if there's a global selectedPaper variable
  if (typeof selectedPaper !== 'undefined' && selectedPaper) {
    return selectedPaper;
  }
  
  // Try to get from local storage or other sources
  return null;
}
