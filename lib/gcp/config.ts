/**
 * Google Cloud Platform (GCP) Configuration & Credentials Manager
 * Centralizes configuration for:
 * - Gemini on Vertex AI
 * - BigQuery (Social & Environmental Datasets)
 * - Vertex AI (Predictive ML Models)
 * - Earth Engine (Geospatial & Environmental Analysis)
 * - Cloud Storage (Datasets, Audio Journals, & Vision Imagery)
 * - Vision AI (Ergonomics, Fatigue, & Study Notes OCR)
 * - Cloud Run (Container Deployment & Readiness Probes)
 * - Pub/Sub (Event-Driven Telemetry & Crisis Alerts)
 */

export interface GCPConfig {
  projectId: string;
  region: string;
  vertexAiLocation: string;
  storageBucket: string;
  bigQueryDataset: string;
  pubsubTopics: {
    telemetry: string;
    crisis: string;
    environmental: string;
  };
  hasServiceAccount: boolean;
  isEmulationMode: boolean;
}

export function getGCPConfig(): GCPConfig {
  const projectId = 
    process.env.GCP_PROJECT_ID || 
    process.env.GOOGLE_CLOUD_PROJECT || 
    'mindpilot-5274b';

  const region = process.env.GCP_REGION || 'asia-south1'; // Default to India region for JEE/NEET/UPSC aspirants
  const vertexAiLocation = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const storageBucket = process.env.GCS_BUCKET_NAME || 'mindpilot-5274b.firebasestorage.app';
  const bigQueryDataset = process.env.BIGQUERY_DATASET || 'mindpilot_analytics';

  const hasCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    process.env.GCP_SERVICE_ACCOUNT_KEY ||
    process.env.K_SERVICE // Cloud Run sets K_SERVICE when running in GCP
  );

  return {
    projectId,
    region,
    vertexAiLocation,
    storageBucket,
    bigQueryDataset,
    pubsubTopics: {
      telemetry: process.env.PUBSUB_TELEMETRY_TOPIC || 'mindpilot-checkin-telemetry',
      crisis: process.env.PUBSUB_CRISIS_TOPIC || 'mindpilot-crisis-alerts',
      environmental: process.env.PUBSUB_ENVIRONMENTAL_TOPIC || 'mindpilot-environmental-alerts',
    },
    hasServiceAccount: hasCredentials,
    isEmulationMode: !hasCredentials && !process.env.GEMINI_API_KEY,
  };
}
