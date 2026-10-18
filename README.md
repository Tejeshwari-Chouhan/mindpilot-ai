# MindPilot AI — Intelligent Wellness & Cognitive Support for Aspirants

MindPilot AI is an AI-powered cognitive wellness and exam-readiness platform built for competitive exam aspirants (JEE, NEET, UPSC). It monitors emotional burnout, study posture ergonomics, mock test error patterns, and regional environmental stress to provide personalized interventions and crisis support.

---

## Google Cloud Platform Architecture

MindPilot AI leverages 8 core Google Cloud services for intelligence, telemetry, environmental analysis, and scalable container deployment:

```
                                  ┌───────────────────────────────┐
                                  │      Cloud Run (Frontend)     │
                                  │ Next.js 16 + React 19 Engine  │
                                  └───────────────┬───────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
  ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
  │     Gemini on Vertex AI      │ │   Vertex AI Predict Engine   │ │     Google Earth Engine      │
  │  • Dual-persona reasoning    │ │ • 7-day burnout trajectory   │ │ • Sentinel-5P PM2.5 / AQI    │
  │  • Journal clinical insights │ │ • Silliness marks loss model │ │ • MODIS surface heat island  │
  │  • Low-latency conversation  │ │ • Feature vector inference   │ │ • Kota, Delhi, Hyd, Blr ESI  │
  └──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
                 │                                │                                │
                 ▼                                ▼                                ▼
  ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
  │       Google BigQuery        │ │       Cloud Pub/Sub          │ │      Cloud Vision AI         │
  │ • 68k+ cohort benchmarks     │ │ • Event-driven architecture  │ │ • Study desk ergonomics      │
  │ • Regional AQI correlation   │ │ • Crisis alerts workflow     │ │ • Handwritten notes OCR      │
  │ • Telemetry streaming buffer │ │ • Async environmental feed   │ │ • Silliness error extractor  │
  └──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
                 │                                                                 │
                 └────────────────────────────────┬────────────────────────────────┘
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │     Google Cloud Storage     │
                                   │ • Student study desk images  │
                                   │ • Handwritten mock tests     │
                                   │ • Resumable Signed V4 URLs   │
                                   └──────────────────────────────┘
```

### 1. Gemini on Vertex AI (`@google-cloud/vertexai`)
- **Reasoning & Natural Language Interfaces**: Powering the multi-turn companion chat (`/companion`) with dual-persona reasoning (Empathetic Peer + Rigorous Cognitive Coach).
- **Journal Sentiment & Diagnostics**: Extracts emotional valence, study friction triggers, and actionable behavioral micro-nudges.
- **Resilient Fallback**: Gracefully falls back to high-accuracy simulated heuristic reasoning when run locally without GCP credentials.

### 2. BigQuery (`@google-cloud/bigquery`)
- **Cohort Analytics & Environmental Benchmarking**: Queries multi-dimensional datasets correlating regional AQI/heat spikes with student attention retention across 68,000+ simulated aspirants.
- **Real-Time Telemetry Streaming**: Streams student check-in, study-session velocity, and cognitive fatigue telemetry directly into BigQuery tables.

### 3. Vertex AI Predictive Models
- **Burnout Trajectory Forecasting**: 7-day multi-variate trajectory model predicting cognitive exhaustion risk based on sleep deficit, daily screen hours, mock test frequency, and environmental stress.
- **Marks Loss Prediction**: Quantifies preventable marks lost to "exam silliness / panic" vs. conceptual gaps, providing targeted recovery interventions.

### 4. Google Earth Engine (`@google/earthengine`)
- **Geospatial & Environmental Analysis**: Satellite telemetry integrating Sentinel-5P (air quality / PM2.5 / NO2), MODIS (land surface temperature / urban heat island effect), and Sentinel-2 (NDVI canopy greenness).
- **Environmental Stress Index (ESI)**: Real-time environmental stress indexing for major competitive exam hubs (Kota, Delhi NCR, Hyderabad, Bengaluru).

### 5. Google Cloud Storage (`@google-cloud/storage`)
- **Secure Multimodal Datasets**: Secure storage for student study desk posture captures, handwritten test papers, and audio reflections.
- **Signed V4 URLs**: Generates short-lived, encrypted signed URLs for secure direct uploads and reads.

### 6. Cloud Vision AI (`@google-cloud/vision`)
- **Study Desk Posture & Ergonomics**: Detects slouching, neck strain, lighting conditions, and phone distractions from desk webcam frames.
- **Handwritten Mock Notes OCR**: Extracts handwritten notes and categorizes errors into *Calculation Slip*, *Formula Confusion*, *Question Misread*, or *Time Panic*.

### 7. Google Cloud Pub/Sub (`@google-cloud/pubsub`)
- **Event-Driven Workflow**: Decouples real-time user interactions from downstream analytics.
- **Dedicated Topics**:
  - `mindpilot-telemetry-events`: Check-in streaming and study session logs.
  - `mindpilot-crisis-alerts`: High-urgency crisis intervention escalation triggers.
  - `mindpilot-environmental-alerts`: Regional hazardous air/heat threshold alerts.

### 8. Google Cloud Run (Container Deployment)
- **Production Containerization**: Multi-stage `Dockerfile` (Node 22 on Alpine) with non-root security.
- **Autoscaling & Health Checks**: Configured via `cloudrun.yaml` for 0–10 instance autoscaling and `/api/health` probes in `asia-south1`.

---

## Cloud Intelligence Hub UI

Explore the live interactive dashboard at `/cloud-intelligence` to test and visualize all 8 GCP components:
- **Overview Architecture**: Live system metrics, topic statuses, and data pipeline throughput.
- **Gemini on Vertex AI**: Interactive testbench for clinical journal evaluation.
- **Earth Engine Satellite**: Real-time regional geospatial maps and ESI breakdown for major coaching hubs.
- **BigQuery Cohort**: Cohort percentile benchmark queries and environmental correlation analysis.
- **Vertex AI Forecast**: Interactive 7-day burnout trajectory & silliness loss predictor.
- **Vision AI Inspector**: Posture and handwritten test error OCR analyzer.
- **Pub/Sub Stream**: Real-time event publisher and live incoming event feed.

---

## Local Development & Setup

### Prerequisites
- Node.js 20+ or 22+ (v22.18.0 tested)
- npm 10+

### Installation
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application, and visit [http://localhost:3000/cloud-intelligence](http://localhost:3000/cloud-intelligence) for the GCP testbed.

---

## Testing & Quality Assurance

Run the Vitest test suite covering all GCP services and resilience fallbacks:
```bash
npm test
```
*Current test suite: 23 passing unit tests across resilience and GCP modules.*

Run linter:
```bash
npm run lint
```

Build production bundle:
```bash
npm run build
```

---

## Cloud Run Deployment

### Option A: Using Google Cloud Build & Cloud Run CLI
```bash
# 1. Set your GCP project
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build container with Cloud Build
gcloud builds submit --config cloudbuild.yaml

# 3. Deploy to Cloud Run
gcloud run services replace cloudrun.yaml --region asia-south1
```

### Option B: Direct Docker Build & Run
```bash
docker build -t mindpilot-ai:latest .
docker run -p 8080:8080 -e PORT=8080 mindpilot-ai:latest
```
Visit `http://localhost:8080/api/health` to verify container health.
