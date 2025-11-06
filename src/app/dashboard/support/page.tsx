import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Support & Escalations - Creator Ops Dashboard',
};

export default async function SupportPage() {
  await requireRole(['ADMIN', 'MANAGER']);

  const tickets = await db.ticket.findMany({
    include: {
      creator: { select: { handle: true, displayName: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ESCALATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LifeBuoy className="h-8 w-8" />
          Support & Escalations
        </h1>
        <p className="text-muted-foreground">
          Manage creator support tickets and escalations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="font-medium">
                      {ticket.creator.displayName || ticket.creator.handle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{ticket.creator.handle}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[ticket.priority]} variant="outline">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[ticket.status]} variant="outline">
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.assignee?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
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
