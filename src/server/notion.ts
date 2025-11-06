import { Client } from '@notionhq/client';
import { env } from '@/env';
import { logger } from '@/lib/logger';
import { db } from './db';

let notion: Client | null = null;

if (env.NOTION_API_KEY) {
  notion = new Client({ auth: env.NOTION_API_KEY });
}

export async function syncCreatorToNotion(creatorId: string) {
  if (!notion || !env.NOTION_DB_CREATORS) {
    logger.warn('Notion not configured, skipping sync');
    return null;
  }

  try {
    const creator = await db.creator.findUnique({
      where: { id: creatorId },
      include: {
        manager: { select: { displayName: true } },
        liveStats: {
          select: { revenueUSD: true, diamonds: true },
          take: 30,
        },
      },
    });

    if (!creator) {
      throw new Error('Creator not found');
    }

    const totalRevenue = creator.liveStats.reduce((sum, s) => sum + s.revenueUSD, 0);
    const totalDiamonds = creator.liveStats.reduce((sum, s) => sum + s.diamonds, 0);

    // Check if already synced
    const existingSync = await db.notionSyncState.findUnique({
      where: {
        entity_entityId: {
          entity: 'Creator',
          entityId: creatorId,
        },
      },
    });

    const properties: any = {
      Handle: { title: [{ text: { content: creator.handle } }] },
      'Display Name': { rich_text: [{ text: { content: creator.displayName || '' } }] },
      Email: { email: creator.email || '' },
      Stage: { select: { name: creator.stage } },
      Region: { rich_text: [{ text: { content: creator.region || '' } }] },
      Manager: { rich_text: [{ text: { content: creator.manager?.displayName || '' } }] },
      'Risk Level': { select: { name: creator.riskLevel } },
      'KYC Status': { select: { name: creator.kycStatus } },
      '30d Revenue': { number: totalRevenue },
      '30d Diamonds': { number: totalDiamonds },
    };

    if (existingSync) {
      // Update existing page
      await notion.pages.update({
        page_id: existingSync.notionPageId,
        properties,
      });

      await db.notionSyncState.update({
        where: { id: existingSync.id },
        data: { lastSyncedAt: new Date() },
      });

      logger.info({ type: 'notion_sync', action: 'update', creatorId });
    } else {
      // Create new page
      const page = await notion.pages.create({
        parent: { database_id: env.NOTION_DB_CREATORS },
        properties,
      });

      await db.notionSyncState.create({
        data: {
          entity: 'Creator',
          entityId: creatorId,
          notionPageId: page.id,
          creatorId,
        },
      });

      logger.info({ type: 'notion_sync', action: 'create', creatorId });
    }

    return true;
  } catch (error) {
    logger.error({ error, context: 'notion_sync', creatorId });
    return null;
  }
}

export async function syncPayoutToNotion(payoutId: string) {
  if (!notion || !env.NOTION_DB_PAYOUTS) {
    logger.warn('Notion not configured, skipping sync');
    return null;
  }

  try {
    const payout = await db.payout.findUnique({
      where: { id: payoutId },
      include: { creator: { select: { handle: true, displayName: true } } },
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    const existingSync = await db.notionSyncState.findUnique({
      where: {
        entity_entityId: {
          entity: 'Payout',
          entityId: payoutId,
        },
      },
    });

    const properties: any = {
      Creator: { title: [{ text: { content: payout.creator.handle } }] },
      'Period Start': { date: { start: payout.periodStart.toISOString().split('T')[0] } },
      'Period End': { date: { start: payout.periodEnd.toISOString().split('T')[0] } },
      Diamonds: { number: payout.diamonds },
      Revenue: { number: payout.revenueUSD },
      Fee: { number: payout.feeUSD },
      'Net Amount': { number: payout.netUSD },
      Status: { select: { name: payout.status } },
      Method: { select: { name: payout.method } },
    };

    if (existingSync) {
      await notion.pages.update({
        page_id: existingSync.notionPageId,
        properties,
      });

      await db.notionSyncState.update({
        where: { id: existingSync.id },
        data: { lastSyncedAt: new Date() },
      });
    } else {
      const page = await notion.pages.create({
        parent: { database_id: env.NOTION_DB_PAYOUTS },
        properties,
      });

      await db.notionSyncState.create({
        data: {
          entity: 'Payout',
          entityId: payoutId,
          notionPageId: page.id,
          payoutId,
        },
      });
    }

    logger.info({ type: 'notion_sync', action: 'sync_payout', payoutId });
    return true;
  } catch (error) {
    logger.error({ error, context: 'notion_sync_payout', payoutId });
    return null;
  }
}
