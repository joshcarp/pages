#!/bin/bash

# Deployment script for Reunion Chatbot Backend to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
REGION="us-central1"
SERVICE_NAME="reunion-chatbot-backend"
GEMINI_API_KEY=""

echo -e "${BLUE}🚀 Deploying Reunion Chatbot Backend to Google Cloud Run${NC}"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK is not installed. Please install it first:${NC}"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID if not set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}📝 Getting current project ID...${NC}"
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ No project ID found. Please set one:${NC}"
        echo "gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Using project: $PROJECT_ID${NC}"
fi

# Get Gemini API key if not set
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}🔑 Please enter your Gemini API key:${NC}"
    read -s GEMINI_API_KEY
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}❌ Gemini API key is required${NC}"
        exit 1
    fi
fi

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy
echo -e "${BLUE}🏗️  Building and deploying...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run with environment variables
echo -e "${BLUE}🌐 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)")

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Service URL: $SERVICE_URL${NC}"
echo -e "${GREEN}✅ Health check: $SERVICE_URL/health${NC}"
echo -e "${GREEN}✅ Chat API: $SERVICE_URL/api/chat${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Update your frontend chatbot to use: $SERVICE_URL/api/chat"
echo "2. Test the API with: curl $SERVICE_URL/health"
echo "3. Add your domain to CORS settings in server.js if needed"
echo ""
echo -e "${BLUE}🔧 To update the service later:${NC}"
echo "gcloud run deploy $SERVICE_NAME --image gcr.io/$PROJECT_ID/$SERVICE_NAME --region $REGION"
