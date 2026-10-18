import { NextResponse } from 'next/server';
import { analyzeStudyDeskErgonomics, analyzeHandwrittenMockNotes } from '@/lib/gcp/vision';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mode } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64 data' }, { status: 400 });
    }

    if (mode === 'mock-notes-ocr') {
      const ocrResult = await analyzeHandwrittenMockNotes(imageBase64);
      return NextResponse.json({
        result: ocrResult,
        engine: 'Google Cloud Vision AI (Document Text OCR)',
      });
    }

    // Default: Desk posture & ergonomics
    const ergonomicsResult = await analyzeStudyDeskErgonomics(imageBase64);
    return NextResponse.json({
      result: ergonomicsResult,
      engine: 'Google Cloud Vision AI (Face & Ergonomic Posture Detection)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Vision AI analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
