import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

export const metadata = {
  title: 'Onboarding Pipeline - Creator Ops Dashboard',
};

export default async function OnboardingPage() {
  await requireRole(['ADMIN', 'MANAGER']);

  const creators = await db.creator.findMany({
    where: {
      stage: { in: ['LEAD', 'APPLIED', 'ONBOARDING'] },
    },
    include: {
      manager: true,
      tasks: {
        where: { status: { not: 'DONE' } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const byStage = {
    LEAD: creators.filter(c => c.stage === 'LEAD'),
    APPLIED: creators.filter(c => c.stage === 'APPLIED'),
    ONBOARDING: creators.filter(c => c.stage === 'ONBOARDING'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GitBranch className="h-8 w-8" />
          Onboarding Pipeline
        </h1>
        <p className="text-muted-foreground">
          Track creators through the onboarding process
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(byStage).map(([stage, stageCreators]) => (
          <Card key={stage}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{stage}</span>
                <Badge>{stageCreators.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageCreators.length > 0 ? (
                stageCreators.map(creator => (
                  <Card key={creator.id} className="p-3">
                    <div className="font-medium">{creator.displayName || creator.handle}</div>
                    <div className="text-xs text-muted-foreground">@{creator.handle}</div>
                    {creator.tasks.length > 0 && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {creator.tasks.length} tasks
                      </Badge>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No creators in this stage
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
