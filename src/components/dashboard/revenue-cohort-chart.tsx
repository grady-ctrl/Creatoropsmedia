'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RevenueByC ohortChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Cohort</CardTitle>
        <CardDescription>Coming soon - Revenue breakdown by join month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Cohort analysis visualization
        </div>
      </CardContent>
    </Card>
  );
}
