import { Suspense } from 'react';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewKPIs } from '@/components/dashboard/overview-kpis';
import { DiamondsChart } from '@/components/dashboard/diamonds-chart';
import { LiveMinutesChart } from '@/components/dashboard/live-minutes-chart';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TopCreatorsTable } from '@/components/dashboard/top-creators-table';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, endOfMonth, subDays, startOfDay } from 'date-fns';

export const metadata = {
  title: 'Overview - Creator Ops Dashboard',
};

async function getOverviewData() {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const last30Days = subDays(now, 30);

  // Active creators count
  const activeCreatorsCount = await db.creator.count({
    where: { stage: 'ACTIVE' },
  });

  // Today's live minutes
  const todayStats = await db.liveStat.aggregate({
    where: {
      date: { gte: today },
    },
    _sum: {
      liveMinutes: true,
    },
  });

  // 7-day diamonds
  const sevenDaysAgo = subDays(now, 7);
  const sevenDayDiamonds = await db.liveStat.aggregate({
    where: {
      date: { gte: sevenDaysAgo },
    },
    _sum: {
      diamonds: true,
    },
  });

  // MTD revenue
  const mtdRevenue = await db.liveStat.aggregate({
    where: {
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: {
      revenueUSD: true,
    },
  });

  // Top 5 earners this month
  const topEarners = await db.creator.findMany({
    where: { stage: 'ACTIVE' },
    select: {
      id: true,
      handle: true,
      displayName: true,
      liveStats: {
        where: {
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          revenueUSD: true,
          diamonds: true,
          liveMinutes: true,
        },
      },
    },
    take: 100,
  });

  const topEarnersWithRevenue = topEarners
    .map(creator => ({
      ...creator,
      totalRevenue: creator.liveStats.reduce((sum, stat) => sum + stat.revenueUSD, 0),
      totalDiamonds: creator.liveStats.reduce((sum, stat) => sum + stat.diamonds, 0),
      totalMinutes: creator.liveStats.reduce((sum, stat) => sum + stat.liveMinutes, 0),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // 30-day diamonds for chart
  const dailyStats = await db.liveStat.groupBy({
    by: ['date'],
    where: {
      date: { gte: last30Days },
    },
    _sum: {
      diamonds: true,
      revenueUSD: true,
      liveMinutes: true,
      averageViewers: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Escalations count
  const escalationsCount = await db.ticket.count({
    where: { status: 'ESCALATED' },
  });

  // Compliance risks count
  const complianceRisksCount = await db.complianceEvent.count({
    where: {
      status: { in: ['OPEN', 'UNDER_REVIEW'] },
      severity: { in: ['CRITICAL', 'WARNING'] },
    },
  });

  // Overdue payouts count
  const overduePayoutsCount = await db.payout.count({
    where: {
      status: 'DUE',
      periodEnd: { lt: subDays(now, 7) },
    },
  });

  return {
    activeCreatorsCount,
    todayLiveMinutes: todayStats._sum.liveMinutes || 0,
    sevenDayDiamonds: sevenDayDiamonds._sum.diamonds || 0,
    mtdRevenue: mtdRevenue._sum.revenueUSD || 0,
    topEarners: topEarnersWithRevenue,
    dailyStats,
    alerts: {
      escalations: escalationsCount,
      complianceRisks: complianceRisksCount,
      overduePayouts: overduePayoutsCount,
    },
  };
}

export default async function DashboardOverviewPage() {
  await requireAuth();
  const data = await getOverviewData();

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights into your creator network performance
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <OverviewKPIs
          activeCreators={data.activeCreatorsCount}
          todayLiveMinutes={data.todayLiveMinutes}
          sevenDayDiamonds={data.sevenDayDiamonds}
          mtdRevenue={data.mtdRevenue}
        />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <DiamondsChart data={data.dailyStats} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <LiveMinutesChart data={data.dailyStats} />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <TopCreatorsTable creators={data.topEarners} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <AlertsPanel alerts={data.alerts} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
