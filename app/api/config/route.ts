import { NextResponse } from 'next/server';
import { getBusinessConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = await getBusinessConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config API error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
