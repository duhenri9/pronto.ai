// ============================================
// PRONTO.IA — Launch Phase Public Endpoint
// ============================================
// GET /api/v1/launch-phase
// Returns founder counter for the landing page.
// Public — no auth required. Cache-Control: 60s SSR.

import { NextResponse } from 'next/server';
import { db, eq, launchPhaseConfig } from '@pronto-ia/database';

export async function GET() {
  try {
    const [config] = await db
      .select()
      .from(launchPhaseConfig)
      .where(eq(launchPhaseConfig.id, 1))
      .limit(1);

    if (!config) {
      return NextResponse.json(
        { active: false, count: 0, cap: 1000 },
        {
          headers: {
            'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
          },
        },
      );
    }

    return NextResponse.json(
      {
        active: config.endedAt === null,
        count: config.founderCount,
        cap: config.founderCap,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      },
    );
  } catch (error) {
    console.error('[launch-phase] Error:', error);
    return NextResponse.json(
      { active: false, count: 0, cap: 1000 },
      { status: 500 },
    );
  }
}
