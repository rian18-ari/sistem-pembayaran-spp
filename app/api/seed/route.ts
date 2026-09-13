import { NextResponse } from 'next/server';
import { seedInitialDatabase } from '@/lib/seed-data';

export async function POST() {
  try {
    const result = await seedInitialDatabase();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
