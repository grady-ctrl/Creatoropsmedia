import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { env } from '@/env';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/server/audit';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-zapier-secret');

    if (env.ZAPIER_WEBHOOK_SECRET && authHeader !== env.ZAPIER_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Expected fields: handle, email, region, referralCode, phone
    const { handle, email, region, referralCode, phone, displayName } = data;

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    // Check if creator already exists
    const existing = await db.creator.findUnique({
      where: { handle },
    });

    if (existing) {
      return NextResponse.json({ error: 'Creator already exists', creatorId: existing.id }, { status: 409 });
    }

    // Find referrer by code if provided
    let referredByCreatorId = null;
    if (referralCode) {
      const referrer = await db.creator.findUnique({
        where: { referralCode },
      });
      referredByCreatorId = referrer?.id || null;
    }

    // Create new creator as LEAD
    const creator = await db.creator.create({
      data: {
        handle,
        displayName: displayName || null,
        email,
        region: region || null,
        phone: phone || null,
        stage: 'LEAD',
        referredByCreatorId,
        kycStatus: 'NOT_STARTED',
        riskLevel: 'LOW',
      },
    });

    // Create referral record if applicable
    if (referredByCreatorId) {
      await db.referral.create({
        data: {
          referrerCreatorId: referredByCreatorId,
          referredCreatorId: creator.id,
          qualified: false,
        },
      });
    }

    await createAuditLog({
      action: 'creator.created_via_zapier',
      entity: 'Creator',
      entityId: creator.id,
      creatorId: creator.id,
      after: { handle, email, stage: 'LEAD' },
    });

    logger.info({ type: 'zapier_creator_intake', creatorId: creator.id, handle });

    return NextResponse.json({
      success: true,
      creatorId: creator.id,
      handle: creator.handle,
      referralCode: creator.referralCode,
    });
  } catch (error) {
    logger.error({ error, context: 'zapier_webhook' });
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
