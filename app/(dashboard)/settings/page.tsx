import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage notification preferences, integrations, and account-level automation controls.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>Decide how you want to be notified about application updates and campaign milestones.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input placeholder="you@example.com" defaultValue="demo@applyflow.ai" />
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input placeholder="+1 (555) 010-1234" />
          </div>
          <div className="md:col-span-2">
            <Button disabled>Update preferences (coming soon)</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect your email, calendar, and collaboration tooling to unlock deeper automation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Gmail / Outlook</p>
            <p className="mt-1 text-xs">Sync recruiter conversations, auto-detect interview invites, and keep statuses fresh.</p>
            <Button className="mt-4" variant="outline" disabled>
              Connect (soon)
            </Button>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Calendar</p>
            <p className="mt-1 text-xs">Auto-schedule interviews, block focus time, and share availability with one click.</p>
            <Button className="mt-4" variant="outline" disabled>
              Connect (soon)
            </Button>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Slack</p>
            <p className="mt-1 text-xs">Get instant updates in your workspace for new matches, submissions, and responses.</p>
            <Button className="mt-4" variant="outline" disabled>
              Connect (soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
