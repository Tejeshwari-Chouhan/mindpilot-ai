import { NextResponse } from 'next/server';
import { generateUploadSignedUrl, uploadToCloudStorage } from '@/lib/gcp/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('fileName') || `asset-${Date.now()}.png`;
  const contentType = searchParams.get('contentType') || 'image/png';
  const folder = (searchParams.get('folder') as any) || 'vision-imagery';

  const signedUrlInfo = await generateUploadSignedUrl(fileName, contentType, folder);

  return NextResponse.json({
    ...signedUrlInfo,
    engine: 'Google Cloud Storage',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, base64Data, contentType, folder } = body;

    if (!fileName || !base64Data) {
      return NextResponse.json(
        { error: 'Missing fileName or base64Data in request' },
        { status: 400 }
      );
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const result = await uploadToCloudStorage(
      fileName,
      buffer,
      contentType || 'application/octet-stream',
      folder || 'vision-imagery'
    );

    return NextResponse.json({
      result,
      engine: 'Google Cloud Storage',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Cloud Storage upload failed', message: error.message },
      { status: 500 }
    );
  }
}
