# Reunion Chatbot Backend

A secure backend service for the Pearson College Reunion Chatbot that handles Gemini API calls without exposing API keys to the frontend.

## Features

- 🔒 **Secure API Key Management**: API keys are stored server-side
- 🚀 **Google Cloud Run Ready**: Optimized for serverless deployment
- 🛡️ **Security**: Rate limiting, CORS, and input validation
- 📊 **Monitoring**: Health checks and structured logging
- 🌐 **Production Ready**: Docker containerized with proper error handling

## Quick Deploy to Google Cloud Run

### Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Google Cloud Project** with billing enabled

### One-Command Deployment

```bash
./deploy.sh
```

The script will:
- Enable required Google Cloud APIs
- Build and push the Docker container
- Deploy to Cloud Run
- Configure environment variables
- Provide you with the service URL

### Manual Deployment

If you prefer manual steps:

```bash
# 1. Set your project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# 3. Build the container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/reunion-chatbot-backend

# 4. Deploy to Cloud Run
gcloud run deploy reunion-chatbot-backend \
    --image gcr.io/YOUR_PROJECT_ID/reunion-chatbot-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "GEMINI_API_KEY=your_api_key_here"
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "reunion-chatbot-backend"
}
```

### Chat API
```
POST /api/chat
Content-Type: application/json

{
  "message": "What time is check-in?"
}
```

Response:
```json
{
  "response": "Check-in begins at 12:00pm (noon) on August 12th, 2025 at the Dining Hall Registration Desk.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Add your Gemini API key to .env
echo "GEMINI_API_KEY=your_key_here" > .env

# Start development server
npm run dev
```

The server will run on `http://localhost:8080`

## Frontend Integration

After deploying, update your frontend chatbot to use the backend API instead of direct Gemini calls. Replace the `getAIResponse` method in your chatbot.js:

```javascript
async getAIResponse(message) {
    const response = await fetch('YOUR_CLOUD_RUN_URL/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    const data = await response.json();
    return data.response;
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Message length and type validation
- **Error Handling**: No internal error exposure
- **Security Headers**: Helmet.js protection

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key (required)
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (production/development)

### CORS Configuration

Update the `origin` array in `server.js` to include your website domain:

```javascript
origin: [
    'https://your-reunion-website.com', // Add your domain here
    'http://localhost:3000',
    // ... other allowed origins
]
```

## Monitoring and Logs

View logs in Google Cloud Console:
```bash
gcloud logs tail reunion-chatbot-backend --project=YOUR_PROJECT_ID
```

## Cost Optimization

- **Serverless**: Pay only for actual usage
- **Auto-scaling**: Scales to zero when not in use
- **Resource limits**: Configured for cost efficiency
- **Gemini Flash**: Uses the cheapest Gemini model

## Troubleshooting

### Common Issues

1. **API Key Not Working**: Ensure your Gemini API key is valid and has sufficient quota
2. **CORS Errors**: Add your domain to the CORS origins list
3. **Rate Limiting**: Increase limits in server.js if needed
4. **Memory Issues**: Increase memory allocation in Cloud Run settings

### Debug Commands

```bash
# Check service status
gcloud run services describe reunion-chatbot-backend --region=us-central1

# View recent logs
gcloud logs read reunion-chatbot-backend --limit=50

# Test API directly
curl https://your-service-url/health
```

## License

MIT License - Feel free to modify for your reunion needs!
