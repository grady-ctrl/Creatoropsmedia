import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { Creator, Manager } from '@prisma/client';

interface CreatorsTableProps {
  creators: (Creator & {
    manager: { displayName: string } | null;
    liveStats: Array<{ revenueUSD: number; diamonds: number }>;
  })[];
}

const stageColors: Record<string, string> = {
  LEAD: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ONBOARDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  OFFBOARDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export function CreatorsTable({ creators }: CreatorsTableProps) {
  if (creators.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-center py-12">
        <p className="text-muted-foreground">No creators found matching your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creator</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="text-right">30d Revenue</TableHead>
            <TableHead className="text-right">30d Diamonds</TableHead>
            <TableHead>Last Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.map((creator) => {
            const initial = creator.displayName?.[0] || creator.handle[0];
            const totalRevenue = creator.liveStats.reduce((sum, s) => sum + s.revenueUSD, 0);
            const totalDiamonds = creator.liveStats.reduce((sum, s) => sum + s.diamonds, 0);

            return (
              <TableRow key={creator.id}>
                <TableCell>
                  <Link href={`/dashboard/creators/${creator.id}`} className="flex items-center gap-3 hover:underline">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{creator.displayName || creator.handle}</div>
                      <div className="text-xs text-muted-foreground">@{creator.handle}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={stageColors[creator.stage]} variant="outline">
                    {creator.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {creator.manager?.displayName || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={riskColors[creator.riskLevel]} variant="outline">
                    {creator.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {totalRevenue > 0 ? formatCurrency(totalRevenue) : '—'}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {totalDiamonds > 0 ? formatNumber(totalDiamonds) : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {creator.lastLiveAt ? formatRelativeTime(creator.lastLiveAt) : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
