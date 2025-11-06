import { requireRole } from '@/server/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export const metadata = {
  title: 'Settings - Creator Ops Dashboard',
};

export default async function SettingsPage() {
  await requireRole('ADMIN');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure platform settings and integrations
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Manage external service connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Discord</div>
                <div className="text-sm text-muted-foreground">Creator announcements and support</div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Lark</div>
                <div className="text-sm text-muted-foreground">Internal manager communications</div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Notion</div>
                <div className="text-sm text-muted-foreground">Database sync for creators and payouts</div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Google Sheets</div>
                <div className="text-sm text-muted-foreground">Export payouts and reports</div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>Configure payment defaults</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Default Method</div>
                <div className="text-sm text-muted-foreground mt-1">Wise Transfer</div>
              </div>
              <div>
                <div className="font-medium">Platform Fee</div>
                <div className="text-sm text-muted-foreground mt-1">15%</div>
              </div>
              <div>
                <div className="font-medium">Payout Period</div>
                <div className="text-sm text-muted-foreground mt-1">Biweekly</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>Configure referral bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Qualification Period</div>
                <div className="text-sm text-muted-foreground mt-1">30 days</div>
              </div>
              <div>
                <div className="font-medium">Bonus Amount</div>
                <div className="text-sm text-muted-foreground mt-1">$100 USD</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
