'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Ticket, CheckSquare, Download } from 'lucide-react';
import { toast } from 'sonner';

export function QuickActions() {
  const actions = [
    {
      icon: UserPlus,
      label: 'Invite Creator',
      onClick: () => toast.info('Creator invitation dialog - Coming soon'),
    },
    {
      icon: Ticket,
      label: 'New Ticket',
      onClick: () => toast.info('New ticket dialog - Coming soon'),
    },
    {
      icon: CheckSquare,
      label: 'Create Task',
      onClick: () => toast.info('New task dialog - Coming soon'),
    },
    {
      icon: Download,
      label: 'Export CSV',
      onClick: () => toast.info('Export dialog - Coming soon'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common operations</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-3"
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
