import { NextResponse } from 'next/server';
import { getGCPConfig } from '@/lib/gcp/config';

export async function GET() {
  const config = getGCPConfig();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    deploymentTarget: 'Google Cloud Run',
    gcp: {
      projectId: config.projectId,
      region: config.region,
      vertexAiLocation: config.vertexAiLocation,
      hasServiceAccount: config.hasServiceAccount,
      emulationMode: config.isEmulationMode,
      services: {
        vertexAI: 'active',
        bigQuery: 'active',
        earthEngine: 'active',
        cloudStorage: 'active',
        visionAI: 'active',
        pubsub: 'active',
      },
    },
  });
}
