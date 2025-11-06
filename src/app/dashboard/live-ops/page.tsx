import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatNumber, formatDuration } from '@/lib/utils';
import { Radio, TrendingUp } from 'lucide-react';
import { startOfDay } from 'date-fns';

export const metadata = {
  title: 'Live Ops - Creator Ops Dashboard',
};

export default async function LiveOpsPage() {
  await requireRole(['ADMIN', 'MANAGER']);

  const today = startOfDay(new Date());

  // Get today's leaderboard
  const todayStats = await db.liveStat.findMany({
    where: {
      date: { gte: today },
    },
    include: {
      creator: {
        select: {
          id: true,
          handle: true,
          displayName: true,
          stage: true,
        },
      },
    },
    orderBy: {
      diamonds: 'desc',
    },
    take: 20,
  });

  // Recently live creators
  const recentlyLive = await db.creator.findMany({
    where: {
      stage: 'ACTIVE',
      lastLiveAt: {
        not: null,
      },
    },
    orderBy: {
      lastLiveAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      handle: true,
      displayName: true,
      lastLiveAt: true,
    },
  });

  const totalLiveMinutes = todayStats.reduce((sum, s) => sum + s.liveMinutes, 0);
  const totalDiamonds = todayStats.reduce((sum, s) => sum + s.diamonds, 0);
  const avgViewers = todayStats.length > 0
    ? Math.round(todayStats.reduce((sum, s) => sum + s.averageViewers, 0) / todayStats.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Radio className="h-8 w-8 text-red-500 animate-pulse" />
          Live Operations
        </h1>
        <p className="text-muted-foreground">
          Real-time monitoring and today&apos;s leaderboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Live Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalLiveMinutes)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Diamonds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalDiamonds)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgViewers)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today&apos;s Leaderboard
            </CardTitle>
            <CardDescription>Top performers by diamonds earned</CardDescription>
          </CardHeader>
          <CardContent>
            {todayStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead className="text-right">Diamonds</TableHead>
                    <TableHead className="text-right">Minutes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayStats.map((stat, index) => {
                    const initial = stat.creator.displayName?.[0] || stat.creator.handle[0];
                    return (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'outline'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {stat.creator.displayName || stat.creator.handle}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{stat.creator.handle}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(stat.diamonds)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDuration(stat.liveMinutes)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No livestreams recorded today yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500" />
              Recently Live
            </CardTitle>
            <CardDescription>Last 10 creators who went live</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyLive.map((creator) => {
                const initial = creator.displayName?.[0] || creator.handle[0];
                return (
                  <div key={creator.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {creator.displayName || creator.handle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{creator.handle}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {creator.lastLiveAt ? new Date(creator.lastLiveAt).toLocaleDateString() : '—'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
