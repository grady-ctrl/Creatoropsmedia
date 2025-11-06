'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';

interface DiamondsChartProps {
  data: Array<{
    date: Date;
    _sum: {
      diamonds: number | null;
      revenueUSD: number | null;
    };
  }>;
}

export function DiamondsChart({ data }: DiamondsChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    diamonds: item._sum.diamonds || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diamonds Trend</CardTitle>
        <CardDescription>Total diamonds received over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatNumber(value), 'Diamonds']}
            />
            <Line
              type="monotone"
              dataKey="diamonds"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
