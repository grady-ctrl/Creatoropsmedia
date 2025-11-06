import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Payouts - Creator Ops Dashboard',
};

export default async function PayoutsPage() {
  await requireRole(['ADMIN', 'FINANCE', 'MANAGER']);

  const payouts = await db.payout.findMany({
    include: {
      creator: {
        select: {
          id: true,
          handle: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  const stats = {
    due: payouts.filter(p => p.status === 'DUE').reduce((sum, p) => sum + p.netUSD, 0),
    processing: payouts.filter(p => p.status === 'PROCESSING').reduce((sum, p) => sum + p.netUSD, 0),
    paid: payouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.netUSD, 0),
    count: payouts.length,
  };

  const statusColors: Record<string, string> = {
    DUE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    HOLD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Payouts
          </h1>
          <p className="text-muted-foreground">
            Manage creator payments and earnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Sheets
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.due)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.processing)}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.paid)}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.count}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Diamonds</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payout.creator.displayName || payout.creator.handle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{payout.creator.handle}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(payout.periodStart), 'MMM dd')} -{' '}
                    {format(new Date(payout.periodEnd), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(payout.diamonds)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payout.revenueUSD)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{formatCurrency(payout.feeUSD)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(payout.netUSD)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payout.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[payout.status]} variant="outline">
                      {payout.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
