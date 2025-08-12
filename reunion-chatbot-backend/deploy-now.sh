#!/bin/bash

# Quick deployment script for Cloud Run
echo "🚀 Deploying Reunion Chatbot Backend to Google Cloud Run"
echo "========================================================="

# Get API key securely
echo "🔑 Please enter your Gemini API key (input will be hidden):"
read -s GEMINI_API_KEY

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ API key is required. Get one at: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo "✅ API key provided"
echo "🚀 Deploying to Cloud Run..."

# Deploy to Cloud Run
gcloud run deploy reunion-chatbot-backend \
    --image gcr.io/gen-lang-client-0539920524/reunion-chatbot-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY"

# Get the service URL
SERVICE_URL=$(gcloud run services describe reunion-chatbot-backend --platform managed --region us-central1 --format "value(status.url)")

echo ""
echo "🎉 Deployment completed!"
echo "✅ Service URL: $SERVICE_URL"
echo "✅ Health check: $SERVICE_URL/health"
echo "✅ Chat API: $SERVICE_URL/api/chat"
echo ""
echo "📋 Next: Update your frontend to use this URL"
