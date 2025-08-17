# AI-Powered Research Paper Summarizer - Setup Guide

This guide will help you set up and use the AI-powered features of the Research Paper Organizer.

## Features

✨ **AI-Powered Summarization**
- TL;DR summaries
- Detailed summaries
- Key points extraction
- Research questions generation

📊 **Interactive Visualizations**
- Keyword frequency charts
- Research timeline visualization
- Topic distribution analysis

🗣️ **Voice Assistant**
- Text-to-speech for summaries
- Voice controls for hands-free operation

🤖 **AI Assistant Chat**
- Ask questions about your research papers
- Get contextual help and insights

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for AI API calls)
- Gemini API key from Google AI

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
2. Click "Get API Key" or sign in to your Google account
3. Create a new project or select an existing one
4. Generate a new API key
5. Copy your API key (keep it secure!)

## Setting Up the AI Features

### First Time Setup

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or serve it using a local web server

2. **Select a Paper**
   - Add a research paper to your collection
   - Click on a paper to view its details

3. **Access AI Features**
   - In the paper details panel, look for the "AI Assistant" section
   - Click the "Summarize Paper" button

4. **Configure API Key**
   - On first use, you'll see a setup screen
   - Enter your Gemini API key
   - Click "Save Key"
   - Your key is stored locally and never sent to our servers

### Using the AI Features

#### Summary Tab
- **TL;DR Summary**: Get a quick 2-3 sentence overview
- **Detailed Summary**: Comprehensive analysis including methodology and findings
- **Key Points**: Bullet-point list of important information
- **Research Questions**: Generated questions for further exploration

#### Visuals Tab
- **Keyword Frequency**: Bar chart showing most common terms
- **Research Timeline**: Line chart of your papers by year
- **Topic Distribution**: Pie chart of research topics

#### AI Assistant Tab
- **Interactive Chat**: Ask questions about the selected paper
- **Contextual Responses**: Get answers based on paper content
- **Research Help**: General research assistance

#### Voice Features
- After generating a summary, use the voice controls
- "Read Aloud" to hear the summary
- "Stop" to pause speech synthesis

## Troubleshooting

### Common Issues

**API Key Error**
- Make sure your API key is valid and active
- Check your internet connection
- Verify the key has proper permissions

**No Response from AI**
- Check if you have selected a paper
- Ensure the paper has sufficient content (title, abstract, or notes)
- Verify your internet connection

**Charts Not Loading**
- Make sure you have papers in your collection
- Check browser console for JavaScript errors
- Ensure Chart.js library is loaded

### Browser Compatibility

**Voice Features**
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

**Chart Rendering**
- All modern browsers supported
- Canvas API required

## Data Privacy & Security

### Your API Key
- Stored locally in your browser's localStorage
- Never transmitted to our servers
- Only sent directly to Google's Gemini API
- You can clear it anytime from browser settings

### Paper Data
- All paper information stays in your browser
- No data is sent to external servers except for AI processing
- AI requests include only the specific paper content being analyzed

### AI Processing
- Paper content is sent to Google's Gemini API for analysis
- Responses are processed locally in your browser
- No permanent storage of your data on external servers

## Advanced Configuration

### Custom Prompts
Developers can modify the prompts in `ai-assistant.js`:
```javascript
// Example: Modify the TL;DR prompt
const prompts = {
  tldr: `Your custom prompt here: ${paperText}`,
  // ...
};
```

### Chart Customization
Modify chart colors and styles in `config.js`:
```javascript
CONFIG.visualization.colors = {
  primary: '#your-color',
  secondary: '#your-color',
  // ...
};
```

### Voice Settings
Adjust voice parameters in `config.js`:
```javascript
CONFIG.voice = {
  rate: 1.0,        // Speech rate (0.5 to 2.0)
  pitch: 1.0,       // Speech pitch (0 to 2)
  language: 'en-US' // Language code
};
```

## API Limits & Costs

### Gemini API
- Free tier: 15 requests per minute, 1500 requests per day
- Paid plans available for higher usage
- Monitor your usage in Google AI Studio

### Recommendations
- Use summaries efficiently (don't regenerate unnecessarily)
- Consider the paper length when generating detailed summaries
- Take advantage of local storage to avoid re-processing

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correctly set
3. Ensure you have a stable internet connection
4. Try refreshing the page and re-entering your API key

For development issues, check the project's GitHub repository for updates and bug reports.

## Updates

The AI features are regularly updated with:
- New visualization types
- Enhanced AI prompts
- Additional voice options
- Performance improvements

Keep your local copy updated for the best experience!
