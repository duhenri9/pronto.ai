// ============================================
// PRONTO.IA — Vertical Interest Signup
// ============================================
// POST /api/v1/vertical-interest
// Captures leads interested in verticals not yet available.
// Validates Brazilian phone number format and deduplicates
// by phone + vertical.

import { NextRequest, NextResponse } from 'next/server';
import { db, eq, and, verticalInterestSignups } from '@pronto-ia/database';
import { Vertical } from '@pronto-ia/types';

const VALID_VERTICALS = new Set<string>(Object.values(Vertical));

// Brazilian mobile phone: +55 11 9xxxx-xxxx or 119xxxxxxxx
const PHONE_BR_REGEX = /^\+?55?\s?\d{2}\s?9?\d{4}-?\d{4}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, vertical, niche } = body;

    // Validate required fields
    if (!phone || !vertical) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, vertical' },
        { status: 400 },
      );
    }

    // Validate vertical
    if (!VALID_VERTICALS.has(vertical)) {
      return NextResponse.json(
        { error: `Invalid vertical. Valid values: ${Object.values(Vertical).join(', ')}` },
        { status: 400 },
      );
    }

    // Validate phone format (loose — accept common Brazilian mobile formats)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 11 || cleaned.length > 13) {
      return NextResponse.json(
        { error: 'Invalid phone number. Expected Brazilian mobile format.' },
        { status: 400 },
      );
    }

    // Deduplicate: same phone + vertical = already signed up (idempotent)
    const [existing] = await db
      .select({ id: verticalInterestSignups.id })
      .from(verticalInterestSignups)
      .where(
        and(
          eq(verticalInterestSignups.phone, cleaned),
          eq(verticalInterestSignups.vertical, vertical),
        ),
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { ok: true, message: 'Already signed up for this vertical.' },
        { status: 200 },
      );
    }

    // Insert
    await db.insert(verticalInterestSignups).values({
      phone: cleaned,
      vertical,
      niche: niche || null,
    });

    return NextResponse.json(
      { ok: true, message: 'Signed up successfully. We will notify you when this specialist arrives.' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[vertical-interest] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
