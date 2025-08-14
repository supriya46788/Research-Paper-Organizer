// AI Configuration File
// Replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API key
// Get your API key from: https://makersuite.google.com/app/apikey

const AI_CONFIG = {
    // Gemini API Configuration
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY', // Replace with your actual API key
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
    // Alternative: OpenAI API Configuration (uncomment to use OpenAI instead)
    // OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY',
    // OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    
    // AI Settings
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    
    // Fallback Settings
    ENABLE_FALLBACK: true,
    FALLBACK_DELAY: 1000, // ms
    
    // Voice Settings
    VOICE_RATE: 0.9,
    VOICE_PITCH: 1.0,
    
    // Chart Settings
    CHART_ANIMATION_DURATION: 1000,
    CHART_COLORS: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI_CONFIG;
}
