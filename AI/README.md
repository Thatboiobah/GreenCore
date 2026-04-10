# GreenCore AI Service

Plant identification and disease detection service powered by PlantNet and Gemini Vision.

## How it works

1. User uploads a crop image
2. PlantNet identifies the plant species
3. Gemini Vision analyzes for diseases
4. Returns diagnosis with treatment and prevention advice

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Run locally
python app.py
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PLANTNET_API_KEY` | PlantNet API key from my.plantnet.org |
| `GEMINI_API_KEY` | Google Gemini API key from aistudio.google.com |

## API

`POST /analyze` — accepts multipart form with `image` field, returns diagnosis result.

## Deployment

Deployed on Render. Set environment variables in Render dashboard under Environment tab.