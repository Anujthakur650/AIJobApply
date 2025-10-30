import { Filter, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jobFilters, jobListings } from "@/lib/data/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function JobsPage() {
  return (
    <div className="container space-y-10 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Curated opportunities</h1>
          <p className="max-w-2xl text-muted-foreground">
            Roles prioritized by relevance score, cultural fit signals, and the automation effort required
            to submit. Everything here ships with pre-filled applications, cover-letter drafts, and follow
            up cadences ready to launch.
          </p>
        </div>
        <Button variant="outline" size="sm" className="self-start">
          <Filter className="mr-2 size-4" />
          Adjust filters
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-xl border border-border/70 bg-background p-5">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Role type</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {jobFilters.types.map((type) => (
                <Badge key={type} variant={type === "Full-time" ? "secondary" : "muted"}>
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Location</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {jobFilters.locations.map((location) => (
                <Badge key={location} variant={location === "Remote" ? "secondary" : "muted"}>
                  <MapPin className="mr-1 size-3" />
                  {location}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Experience level</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {jobFilters.experience.map((experience) => (
                <Badge key={experience} variant={experience === "Senior" ? "secondary" : "muted"}>
                  {experience}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Reset filters
          </Button>
        </aside>

        <div className="space-y-5">
          {jobListings.map((job) => (
            <Card key={job.id} className="border-border/70 bg-background/90 shadow-sm transition hover:border-primary/40">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <Badge variant="muted" className="w-fit">
                    {job.company}
                  </Badge>
                  <CardTitle className="text-2xl text-foreground">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3" /> {job.location} • {job.type}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-sm">
                    <Sparkles className="mr-1 size-3" /> Match {job.relevanceScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{job.summary}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                  <span>Target compensation: {job.salary.includes("$") ? job.salary : formatCurrency(Number(job.salary))}</span>
                  <span>Posted {job.posted}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm">Review autofill</Button>
                  <Button size="sm" variant="outline">
                    Schedule follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
