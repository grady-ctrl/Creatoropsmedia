import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertsPanelProps {
  alerts: {
    escalations: number;
    complianceRisks: number;
    overduePayouts: number;
  };
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const alertItems = [
    {
      icon: AlertTriangle,
      label: 'Escalated Tickets',
      count: alerts.escalations,
      href: '/dashboard/support?status=ESCALATED',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      icon: Shield,
      label: 'Compliance Risks',
      count: alerts.complianceRisks,
      href: '/dashboard/compliance',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      icon: DollarSign,
      label: 'Overdue Payouts',
      count: alerts.overduePayouts,
      href: '/dashboard/payouts?status=DUE',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alerts & Escalations</CardTitle>
        <CardDescription>Items requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <Badge variant={item.count > 0 ? 'destructive' : 'secondary'}>
                {item.count}
              </Badge>
            </div>
          </Link>
        ))}

        {alerts.escalations === 0 && alerts.complianceRisks === 0 && alerts.overduePayouts === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            All clear! No urgent items.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
