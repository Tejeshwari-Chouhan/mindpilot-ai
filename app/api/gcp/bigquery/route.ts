import { NextResponse } from 'next/server';
import { 
  queryEnvironmentalAndSocialDatasets, 
  getBigQueryCohortBenchmark, 
  streamTelemetryToBigQuery 
} from '@/lib/gcp/bigquery';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubCity = searchParams.get('hub') || 'Kota';

  const metrics = await queryEnvironmentalAndSocialDatasets(hubCity);

  return NextResponse.json({
    metrics,
    dataset: 'mindpilot_analytics.environmental_social_telemetry',
    engine: 'Google Cloud BigQuery',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'benchmark') {
      const { examType, userBurnout, userSleep } = body;
      const benchmark = await getBigQueryCohortBenchmark(
        examType || 'JEE',
        userBurnout ?? 65,
        userSleep ?? 5.5
      );
      return NextResponse.json({ benchmark, engine: 'Google Cloud BigQuery' });
    }

    if (body.action === 'stream') {
      const { checkIn, profile, environmentalContext } = body;
      const streamResult = await streamTelemetryToBigQuery(checkIn, profile, environmentalContext);
      return NextResponse.json({ streamResult, engine: 'Google Cloud BigQuery' });
    }

    const metrics = await queryEnvironmentalAndSocialDatasets(body.hubCity || 'Kota');
    return NextResponse.json({ metrics, engine: 'Google Cloud BigQuery' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'BigQuery operation failed', message: error.message },
      { status: 500 }
    );
  }
}
