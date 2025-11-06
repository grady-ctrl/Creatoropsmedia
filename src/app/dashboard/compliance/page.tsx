import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Compliance - Creator Ops Dashboard',
};

export default async function CompliancePage() {
  await requireRole(['ADMIN', 'MANAGER']);

  const events = await db.complianceEvent.findMany({
    include: {
      creator: { select: { handle: true, displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const severityColors: Record<string, string> = {
    INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    BLOCKING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    ESCALATED: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Compliance Monitoring
        </h1>
        <p className="text-muted-foreground">
          Track KYC, age verification, and content flags
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="font-medium">
                      {event.creator.displayName || event.creator.handle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{event.creator.handle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{event.title}</TableCell>
                  <TableCell>
                    <Badge className={severityColors[event.severity]} variant="outline">
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status]} variant="outline">
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(event.createdAt), 'MMM dd, yyyy')}
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
