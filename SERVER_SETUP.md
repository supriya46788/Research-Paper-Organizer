# Server Setup Guide

## Overview
The Research Paper Organizer now includes a Node.js backend server that handles AI summarization requests. This eliminates the need for users to provide their own API keys.

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Gemini API key from Google AI Studio

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   ```

### 3. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### 4. Start the Server
```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Vercel (Recommended - Free)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variable:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key

### Option 2: Heroku
1. Install Heroku CLI

2. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

3. Set environment variable:
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   ```

4. Deploy:
   ```bash
   git add .
   git commit -m "Deploy server version"
   git push heroku main
   ```

### Option 3: Railway
1. Connect your GitHub repository to Railway
2. Add environment variable `GEMINI_API_KEY`
3. Deploy automatically

### Option 4: AWS/Google Cloud/Azure
Follow standard Node.js deployment procedures for your chosen platform.

## API Endpoints

### POST /api/summarize
Generates AI summary for research papers.

**Request:**
```json
{
  "prompt": "Provide a concise TL;DR summary of this research paper: Title: ..."
}
```

**Response:**
```json
{
  "summary": "Generated summary text here..."
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file. It's already in `.gitignore`.

2. **API Key Protection**: The Gemini API key is stored server-side and never exposed to clients.

3. **Rate Limiting**: Consider implementing rate limiting in production to prevent abuse.

4. **CORS**: The server is configured to accept requests from any origin. In production, consider restricting this.

## Troubleshooting

### Common Issues

1. **"Server configuration error"**
   - Check that `GEMINI_API_KEY` is set in your environment variables
   - Verify the API key is valid

2. **Port already in use**
   - Change the `PORT` in your `.env` file
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **API request failures**
   - Check your internet connection
   - Verify your Gemini API key hasn't expired
   - Check API quota limits

### Logs
The server logs all requests and errors to the console. Use these for debugging.

## Cost Considerations

**Gemini API Costs (as of 2024):**
- **Free Tier**: 15 requests per minute, 100 requests per day
- **Paid Tier**: Very affordable - approximately $0.001 per request

**Server Hosting:**
- **Vercel**: Free tier covers most small projects
- **Heroku**: ~$7/month for basic dyno
- **Railway**: Free tier available, then pay-as-you-go

## Scaling

For high-traffic applications, consider:
1. Implementing request caching
2. Adding rate limiting per user
3. Using a CDN for static assets
4. Implementing proper error handling and retry logic

## Migration from Client-Side

If you were previously using the client-side API key system:
1. The server handles all API communication now
2. Users no longer need to provide API keys
3. The interface automatically skips the API key setup
4. All existing paper data is preserved
