import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const metadata = {
  title: 'Referrals - Creator Ops Dashboard',
};

export default async function ReferralsPage() {
  await requireRole(['ADMIN', 'MANAGER']);

  const referrals = await db.referral.findMany({
    include: {
      referrer: { select: { handle: true, displayName: true } },
      referred: { select: { handle: true, displayName: true, stage: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const leaderboard = await db.creator.findMany({
    where: { referrals: { some: {} } },
    include: {
      referrals: {
        where: { qualified: true },
      },
    },
    take: 10,
  });

  const topReferrers = leaderboard
    .map(c => ({
      ...c,
      referralCount: c.referrals.length,
      totalBonus: c.referrals.reduce((sum, r) => sum + r.bonusUSD, 0),
    }))
    .sort((a, b) => b.referralCount - a.referralCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserPlus className="h-8 w-8" />
          Referrals
        </h1>
        <p className="text-muted-foreground">
          Track creator referrals and bonuses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topReferrers.map((creator, index) => (
              <div key={creator.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Badge variant={index < 3 ? 'default' : 'outline'}>#{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-sm">
                      {creator.displayName || creator.handle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {creator.referralCount} qualified
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(creator.totalBonus)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referred</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="font-medium">
                        {referral.referrer.displayName || referral.referrer.handle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{referral.referrer.handle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {referral.referred.displayName || referral.referred.handle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{referral.referred.handle}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(referral.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.qualified ? 'default' : 'outline'}>
                        {referral.qualified ? 'Qualified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(referral.bonusUSD)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
