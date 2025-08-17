// Configuration for AI-Powered Features
const CONFIG = {
  // API Configuration
  gemini: {
    // API URL endpoint for Gemini
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    // Users should set their own API key through environment or UI
    apiKey: process.env.GEMINI_API_KEY || '', // Will be set by user
  },
  
  // Voice settings
  voice: {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    language: 'en-US'
  },
  
  // Chart settings
  visualization: {
    defaultChartType: 'bar',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      dark: '#374151'
    }
  },

  // AI Features
  ai: {
    maxTokens: 1000,
    temperature: 0.7,
    summaryTypes: {
      tldr: 'TL;DR',
      detailed: 'Detailed Summary',
      keypoints: 'Key Points',
      questions: 'Generated Questions'
    }
  }
};

// API Key management functions
const ApiKeyManager = {
  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
      CONFIG.gemini.apiKey = key.trim();
      return true;
    }
    return false;
  },
  
  getApiKey() {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      CONFIG.gemini.apiKey = stored;
      return stored;
    }
    return CONFIG.gemini.apiKey;
  },
  
  hasApiKey() {
    const key = this.getApiKey();
    return key && key.length > 0;
  },
  
  clearApiKey() {
    localStorage.removeItem('gemini_api_key');
    CONFIG.gemini.apiKey = '';
  }
};

// Initialize API key from storage on load
ApiKeyManager.getApiKey();

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, ApiKeyManager };
}
