import { NextResponse } from 'next/server';
import { 
  publishPubSubEvent, 
  getRecentPubSubEvents,
  dispatchCheckInTelemetryEvent,
  dispatchCrisisAlertEvent,
  dispatchEnvironmentalAlertEvent
} from '@/lib/gcp/pubsub';

export async function GET() {
  const events = getRecentPubSubEvents();
  return NextResponse.json({
    events,
    totalDispatched: events.length,
    engine: 'Google Cloud Pub/Sub',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, topic, eventType, priority, payload } = body;

    if (action === 'dispatch-checkin') {
      const res = await dispatchCheckInTelemetryEvent(payload);
      return NextResponse.json({ result: res, engine: 'Google Cloud Pub/Sub' });
    }

    if (action === 'dispatch-crisis') {
      const res = await dispatchCrisisAlertEvent(payload);
      return NextResponse.json({ result: res, engine: 'Google Cloud Pub/Sub' });
    }

    if (action === 'dispatch-environmental') {
      const res = await dispatchEnvironmentalAlertEvent(payload);
      return NextResponse.json({ result: res, engine: 'Google Cloud Pub/Sub' });
    }

    // Generic event publish
    const result = await publishPubSubEvent(
      topic || 'mindpilot-general-events',
      eventType || 'CHECKIN_TELEMETRY',
      priority || 'NORMAL',
      payload || {}
    );

    return NextResponse.json({ result, engine: 'Google Cloud Pub/Sub' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Pub/Sub publish failed', message: error.message },
      { status: 500 }
    );
  }
}
