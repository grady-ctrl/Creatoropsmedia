import { NextRequest, NextResponse } from 'next/server';
import { dailyRollupQueue } from '@/server/worker';
import { env } from '@/env';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dailyRollupQueue) {
      logger.warn('Daily rollup queue not configured');
      return NextResponse.json({ error: 'Queue not configured' }, { status: 400 });
    }

    // Add rollup job to queue
    await dailyRollupQueue.add('daily-rollup', {
      date: new Date().toISOString(),
      syncNotion: true,
    });

    logger.info({ type: 'cron_triggered', job: 'daily-rollup' });

    return NextResponse.json({ success: true, message: 'Daily rollup job queued' });
  } catch (error) {
    logger.error({ error, context: 'cron_daily_rollup' });
    return NextResponse.json({ error: 'Failed to queue rollup job' }, { status: 500 });
  }
}
