import { NextResponse } from 'next/server';
import { 
  getEarthEngineEnvironmentalProfile, 
  calculateEnvironmentalRetentionDiscount,
  EXAM_HUBS_GEO 
} from '@/lib/gcp/earth-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'kota';

  const profile = await getEarthEngineEnvironmentalProfile(city);
  const discount = calculateEnvironmentalRetentionDiscount(profile.environmentalStressIndex);

  return NextResponse.json({
    hub: profile,
    retentionImpact: discount,
    availableHubs: Object.keys(EXAM_HUBS_GEO),
    source: 'Google Earth Engine (Copernicus Sentinel-5P, MODIS, Sentinel-2)',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const city = body.city || 'kota';
    const profile = await getEarthEngineEnvironmentalProfile(city);
    const discount = calculateEnvironmentalRetentionDiscount(profile.environmentalStressIndex);

    return NextResponse.json({
      hub: profile,
      retentionImpact: discount,
      source: 'Google Earth Engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process Earth Engine environmental query', message: error.message },
      { status: 500 }
    );
  }
}
