import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '@/env';
import { logger } from '@/lib/logger';
import { db } from './db';
import { syncCreatorToNotion, syncPayoutToNotion } from './notion';
import { startOfDay, subDays } from 'date-fns';

// Redis connection for BullMQ
const connection = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : undefined;

// Queue definitions
export const notionSyncQueue = connection
  ? new Queue('notion-sync', { connection })
  : null;

export const dailyRollupQueue = connection
  ? new Queue('daily-rollup', { connection })
  : null;

// Notion Sync Worker
if (connection) {
  const notionWorker = new Worker(
    'notion-sync',
    async (job) => {
      const { entity, entityId } = job.data;

      logger.info({ type: 'worker_job', queue: 'notion-sync', entity, entityId });

      try {
        if (entity === 'Creator') {
          await syncCreatorToNotion(entityId);
        } else if (entity === 'Payout') {
          await syncPayoutToNotion(entityId);
        }

        return { success: true };
      } catch (error) {
        logger.error({ error, context: 'notion_worker', entity, entityId });
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000, // 10 jobs per second
      },
    }
  );

  notionWorker.on('completed', (job) => {
    logger.info({ type: 'worker_completed', job: job.id });
  });

  notionWorker.on('failed', (job, err) => {
    logger.error({ type: 'worker_failed', job: job?.id, error: err.message });
  });
}

// Daily Rollup Worker
if (connection) {
  const rollupWorker = new Worker(
    'daily-rollup',
    async (job) => {
      logger.info({ type: 'worker_job', queue: 'daily-rollup', date: job.data.date });

      try {
        const date = job.data.date ? new Date(job.data.date) : new Date();
        const dayStart = startOfDay(date);

        // Aggregate stats for all active creators
        const activeCreators = await db.creator.findMany({
          where: { stage: 'ACTIVE' },
          select: { id: true },
        });

        logger.info({
          type: 'rollup_start',
          date: dayStart.toISOString(),
          creatorCount: activeCreators.length,
        });

        // Compute KPIs
        const stats = await db.liveStat.aggregate({
          where: {
            date: { gte: dayStart, lt: subDays(dayStart, -1) },
          },
          _sum: {
            liveMinutes: true,
            diamonds: true,
            revenueUSD: true,
          },
          _avg: {
            averageViewers: true,
          },
        });

        logger.info({
          type: 'rollup_complete',
          stats: {
            liveMinutes: stats._sum.liveMinutes || 0,
            diamonds: stats._sum.diamonds || 0,
            revenue: stats._sum.revenueUSD || 0,
            avgViewers: Math.round(stats._avg.averageViewers || 0),
          },
        });

        // Optionally sync to Notion
        if (job.data.syncNotion && notionSyncQueue) {
          const creatorsToSync = activeCreators.slice(0, 50); // Limit to avoid rate limits
          for (const creator of creatorsToSync) {
            await notionSyncQueue.add('sync-creator', {
              entity: 'Creator',
              entityId: creator.id,
            });
          }
        }

        return { success: true, stats };
      } catch (error) {
        logger.error({ error, context: 'rollup_worker' });
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  rollupWorker.on('completed', (job) => {
    logger.info({ type: 'worker_completed', job: job.id, queue: 'daily-rollup' });
  });

  rollupWorker.on('failed', (job, err) => {
    logger.error({ type: 'worker_failed', job: job?.id, queue: 'daily-rollup', error: err.message });
  });
}

logger.info({ type: 'worker_started', queues: ['notion-sync', 'daily-rollup'] });

// Keep the process running
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
