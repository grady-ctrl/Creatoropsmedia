'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';

interface LiveMinutesChartProps {
  data: Array<{
    date: Date;
    _sum: {
      liveMinutes: number | null;
      averageViewers: number | null;
    };
  }>;
}

export function LiveMinutesChart({ data }: LiveMinutesChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    minutes: item._sum.liveMinutes || 0,
    avgViewers: Math.round((item._sum.averageViewers || 0) / 10), // Scale down for visibility
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Minutes vs Avg Viewers</CardTitle>
        <CardDescription>Daily streaming activity and audience size</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value * 10)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Avg Viewers') return [formatNumber(value * 10), name];
                return [formatNumber(value), name];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="minutes"
              fill="hsl(var(--primary))"
              name="Live Minutes"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgViewers"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Avg Viewers"
              dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
