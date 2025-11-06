import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Gem, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber, formatDuration } from '@/lib/utils';

interface OverviewKPIsProps {
  activeCreators: number;
  todayLiveMinutes: number;
  sevenDayDiamonds: number;
  mtdRevenue: number;
}

export function OverviewKPIs({
  activeCreators,
  todayLiveMinutes,
  sevenDayDiamonds,
  mtdRevenue,
}: OverviewKPIsProps) {
  const kpis = [
    {
      title: 'Active Creators',
      value: formatNumber(activeCreators),
      icon: Users,
      description: 'Currently streaming',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Today Live Minutes',
      value: formatDuration(todayLiveMinutes),
      icon: Clock,
      description: 'Across all creators',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: '7-Day Diamonds',
      value: formatNumber(sevenDayDiamonds),
      icon: Gem,
      description: 'Total gifts received',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'MTD Revenue',
      value: formatCurrency(mtdRevenue),
      icon: DollarSign,
      description: 'Month-to-date earnings',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
