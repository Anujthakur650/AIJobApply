import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { applicationRows } from "@/lib/data/mock-data";

const statusMeta: Record<
  (typeof applicationRows)[number]["status"],
  { label: string; variant: "muted" | "secondary" | "default" }
> = {
  queued: { label: "Queued", variant: "muted" },
  "in-progress": { label: "In progress", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
};

export default function ApplicationsPage() {
  return (
    <div className="container space-y-10 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Application pipeline</h1>
          <p className="text-muted-foreground">
            Monitor status across automation stages, identify where human review is required, and keep
            follow-ups on schedule.
          </p>
        </div>
        <Button variant="outline">Export snapshot</Button>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Outcomes at a glance</CardTitle>
          <CardDescription>Queued items require your approval before launch.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableCaption>Last synced moments ago—automation keeps this in lockstep.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted via</TableHead>
                <TableHead>Applied on</TableHead>
                <TableHead>Next step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicationRows.map((application) => {
                const status = statusMeta[application.status];
                return (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium text-foreground">{application.role}</TableCell>
                    <TableCell>{application.company}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{application.submittedVia}</TableCell>
                    <TableCell>{application.appliedOn}</TableCell>
                    <TableCell className="text-muted-foreground">{application.nextStep}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
