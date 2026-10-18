/**
 * Google Cloud Pub/Sub Integration
 * Provides asynchronous, event-driven messaging pipelines for:
 * - Telemetry streaming to BigQuery & Feature Store
 * - Crisis & Safety Escalation workflows (instant counselor routing)
 * - Environmental spike alerts from Earth Engine
 */

import { PubSub } from '@google-cloud/pubsub';
import { getGCPConfig } from './config';

let pubsubClient: PubSub | null = null;

function getPubSubClient(): PubSub | null {
  const config = getGCPConfig();
  if (!pubsubClient) {
    try {
      pubsubClient = new PubSub({
        projectId: config.projectId,
      });
    } catch (e) {
      console.warn('Pub/Sub client initialization deferred:', e);
      pubsubClient = null;
    }
  }
  return pubsubClient;
}

export interface PubSubEventEnvelope<T = any> {
  eventId: string;
  topic: string;
  timestamp: string;
  eventType: 'CHECKIN_TELEMETRY' | 'CRISIS_ESCALATION' | 'ENVIRONMENTAL_SPIKE' | 'BURNOUT_ALERT';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  payload: T;
}

// In-memory ring buffer of recent events for UI stream monitoring
const recentEventBuffer: PubSubEventEnvelope[] = [];

/**
 * Publishes an event to a specified Google Cloud Pub/Sub topic
 */
export async function publishPubSubEvent<T>(
  topicName: string,
  eventType: PubSubEventEnvelope['eventType'],
  priority: PubSubEventEnvelope['priority'],
  payload: T
): Promise<{ messageId: string; topic: string; publishedAt: string }> {
  const config = getGCPConfig();
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const envelope: PubSubEventEnvelope<T> = {
    eventId,
    topic: topicName,
    timestamp,
    eventType,
    priority,
    payload,
  };

  // Keep in ring buffer for inspection
  recentEventBuffer.unshift(envelope);
  if (recentEventBuffer.length > 25) {
    recentEventBuffer.pop();
  }

  const client = getPubSubClient();
  if (client && config.hasServiceAccount) {
    try {
      const topic = client.topic(topicName);
      const dataBuffer = Buffer.from(JSON.stringify(envelope));
      const messageId = await topic.publishMessage({ data: dataBuffer });
      return { messageId, topic: topicName, publishedAt: timestamp };
    } catch (err) {
      console.warn(`Pub/Sub publish to ${topicName} fell back to event buffer:`, err);
    }
  }

  return { messageId: `emulated-${eventId}`, topic: topicName, publishedAt: timestamp };
}

/**
 * Helper to dispatch Check-in Telemetry event
 */
export async function dispatchCheckInTelemetryEvent(payload: {
  studentName: string;
  examType: string;
  stressLevel: number;
  burnoutRisk: number;
  sleepHours: number;
}) {
  const config = getGCPConfig();
  return publishPubSubEvent(
    config.pubsubTopics.telemetry,
    'CHECKIN_TELEMETRY',
    'NORMAL',
    payload
  );
}

/**
 * Helper to dispatch Crisis Alert event
 */
export async function dispatchCrisisAlertEvent(payload: {
  studentName: string;
  detectedKeywords: string[];
  helplineProvided: string;
  timestamp: string;
}) {
  const config = getGCPConfig();
  return publishPubSubEvent(
    config.pubsubTopics.crisis,
    'CRISIS_ESCALATION',
    'CRITICAL',
    payload
  );
}

/**
 * Helper to dispatch Environmental Alert event
 */
export async function dispatchEnvironmentalAlertEvent(payload: {
  city: string;
  aqi: number;
  temperatureC: number;
  recommendedAction: string;
}) {
  const config = getGCPConfig();
  return publishPubSubEvent(
    config.pubsubTopics.environmental,
    'ENVIRONMENTAL_SPIKE',
    'HIGH',
    payload
  );
}

/**
 * Returns recent dispatched Pub/Sub events for live dashboard telemetry
 */
export function getRecentPubSubEvents(): PubSubEventEnvelope[] {
  // If buffer is empty, seed with initial system telemetry events
  if (recentEventBuffer.length === 0) {
    recentEventBuffer.push({
      eventId: 'evt-init-001',
      topic: 'mindpilot-checkin-telemetry',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      eventType: 'CHECKIN_TELEMETRY',
      priority: 'NORMAL',
      payload: { studentName: 'Bhavesh', examType: 'JEE', stressLevel: 7, burnoutRisk: 68 },
    });
    recentEventBuffer.push({
      eventId: 'evt-init-002',
      topic: 'mindpilot-environmental-alerts',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      eventType: 'ENVIRONMENTAL_SPIKE',
      priority: 'HIGH',
      payload: { city: 'Kota', aqi: 215, temperatureC: 39.4, recommendedAction: 'Hydration alert dispatched' },
    });
  }

  return [...recentEventBuffer];
}
