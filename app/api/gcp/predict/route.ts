import { NextResponse } from 'next/server';
import { predictResilienceHorizon } from '@/lib/gcp/vertex-predict';
import { DailyLogEntry, StudentProfile } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile: StudentProfile = body.profile;
    const history: DailyLogEntry[] = body.history || [];

    if (!profile) {
      return NextResponse.json({ error: 'Missing student profile' }, { status: 400 });
    }

    const prediction = await predictResilienceHorizon(profile, history);

    return NextResponse.json({
      prediction,
      engine: 'Google Cloud Vertex AI Predictive Model',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Vertex AI prediction failed', message: error.message },
      { status: 500 }
    );
  }
}
