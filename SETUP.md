# AI-Powered Research Paper Organizer - Setup Guide

## 🚀 Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Application

1. Open `config.js` in your code editor
2. Replace `'YOUR_GEMINI_API_KEY'` with your actual API key:
   ```javascript
   GEMINI_API_KEY: 'your-actual-api-key-here',
   ```

### 3. Test the AI Features

1. Open `index.html` in your browser
2. Add a research paper with title, authors, and abstract
3. Click on the paper to open details
4. Try the AI features:
   - **Summary Tab**: Generate AI-powered summaries
   - **Visuals Tab**: Create data visualizations
   - **AI Assistant Tab**: Chat with AI about the paper

## 🔧 Advanced Configuration

### Alternative: OpenAI API

If you prefer to use OpenAI instead of Gemini:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In `config.js`, uncomment the OpenAI configuration:
   ```javascript
   // OPENAI_API_KEY: 'your-openai-api-key',
   // OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
   ```
3. Update `script.js` to use OpenAI endpoints

### Environment Variables (Recommended for Production)

For better security, use environment variables:

1. Create a `.env` file:
   ```
   GEMINI_API_KEY=your-actual-api-key
   ```

2. Update `config.js` to read from environment:
   ```javascript
   GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
   ```

## 🎯 Features Overview

### AI Summary Generation
- **TL;DR**: Quick 2-3 sentence summary
- **Key Points**: 5-7 bullet points of main findings
- **Detailed Analysis**: 3-4 paragraph comprehensive analysis
- **Research Questions**: 3-5 questions for further investigation

### Data Visualizations
- **Keyword Frequency**: Bar chart of most common terms
- **Timeline Analysis**: Publication trends over time
- **Topic Distribution**: Doughnut chart of research areas

### Voice Assistant
- **Text-to-Speech**: Read summaries aloud
- **Play/Stop Controls**: Control voice playback
- **Browser Compatibility**: Works with Web Speech API

### AI Research Assistant
- **Context-Aware Chat**: AI understands the selected paper
- **Academic Responses**: Tailored for research discussions
- **Multiple Topics**: Methodology, results, limitations, future work

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for production
3. **Rotate API keys** regularly
4. **Monitor API usage** to avoid unexpected charges
5. **Set rate limits** if needed

## 🐛 Troubleshooting

### Common Issues

1. **"API request failed"**
   - Check your API key is correct
   - Verify you have sufficient API credits
   - Check internet connection

2. **"Invalid API response format"**
   - API service might be temporarily down
   - Check API documentation for changes
   - Fallback responses will be used

3. **Voice not working**
   - Ensure browser supports Web Speech API
   - Check microphone permissions
   - Try a different browser (Chrome recommended)

### Fallback Mode

The application includes intelligent fallback:
- If API calls fail, mock responses are used
- All features remain functional
- User experience is preserved

## 📊 API Usage Guidelines

### Gemini API Limits
- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **Cost**: $0.0005 per 1K characters (input + output)

### Optimization Tips
- Keep abstracts concise for faster processing
- Use specific questions in AI chat
- Batch similar requests when possible

## 🚀 Deployment

### Local Development
```bash
# Simple local server
python -m http.server 8000
# or
npx serve .
```

### Production Deployment
1. Set up environment variables
2. Configure CORS if needed
3. Use HTTPS for security
4. Monitor API usage and costs

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API key configuration
3. Test with a simple paper first
4. Review the troubleshooting section above

## 🔄 Updates

To update the application:
1. Backup your `config.js` with your API keys
2. Pull the latest changes
3. Restore your API configuration
4. Test all features

---

**Note**: This application uses client-side API calls. For production use, consider implementing a backend server to handle API calls securely.
