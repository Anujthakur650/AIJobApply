import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="container space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="max-w-2xl text-muted-foreground">
          Configure account details, notification preferences, and automation guardrails. All settings are
          mocked for this preview.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Update the basics tied to authentication and collaboration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Ava Candidate" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" defaultValue="demo@aijobapply.com" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="headline">Professional headline</Label>
              <Input id="headline" defaultValue="Product-focused Full-Stack Engineer" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell collaborators how you'd like automation to support your search."
                defaultValue="Focused on product-led growth roles where automation amplifies human creativity."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline">
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how the platform keeps you in the loop. Each toggle is non-functional in the preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <p className="text-sm font-semibold text-muted-foreground">Daily digest</p>
              <p className="text-sm text-muted-foreground">
                Receive a morning summary of queued applications, new matches, and follow-up reminders.
              </p>
              <Button variant="secondary" size="sm" className="mt-3">
                Enabled
              </Button>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <p className="text-sm font-semibold text-muted-foreground">Real-time alerts</p>
              <p className="text-sm text-muted-foreground">
                Slack or email pings when recruiters respond or a task requires approval.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Configure channel
              </Button>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <p className="text-sm font-semibold text-muted-foreground">Security</p>
              <p className="text-sm text-muted-foreground">
                Multi-factor auth, credential rotation, and audit events. Placeholder for future settings.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Review activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
