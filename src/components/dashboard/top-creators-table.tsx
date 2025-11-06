import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatNumber, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface TopCreator {
  id: string;
  handle: string;
  displayName: string | null;
  totalRevenue: number;
  totalDiamonds: number;
  totalMinutes: number;
}

interface TopCreatorsTableProps {
  creators: TopCreator[];
}

export function TopCreatorsTable({ creators }: TopCreatorsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top 5 Earners This Month
        </CardTitle>
        <CardDescription>Highest performing creators by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {creators.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Diamonds</TableHead>
                <TableHead className="text-right">Live Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map((creator, index) => {
                const initial = creator.displayName?.[0] || creator.handle[0];
                const rankBadge = index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline';

                return (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <Badge variant={rankBadge}>#{index + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/creators/${creator.id}`} className="flex items-center gap-2 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{creator.displayName || creator.handle}</div>
                          <div className="text-xs text-muted-foreground">@{creator.handle}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(creator.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(creator.totalDiamonds)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDuration(creator.totalMinutes)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No performance data yet this month
          </div>
        )}
      </CardContent>
    </Card>
  );
}
