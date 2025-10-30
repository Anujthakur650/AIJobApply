import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileData } from "@/lib/data/mock-data";

export default function ProfilePage() {
  return (
    <div className="container space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Candidate profile</h1>
        <p className="max-w-2xl text-muted-foreground">
          These sections power document generation, autofill policies, and the relevance model that ranks
          opportunities for the candidate.
        </p>
      </header>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{profileData.personal.fullName}</CardTitle>
              <CardDescription>{profileData.personal.headline}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Location</p>
                <p className="text-base text-foreground">{profileData.personal.location}</p>
              </div>
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Primary contact</p>
                <p className="text-base text-foreground">{profileData.personal.contact}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          {profileData.experience.map((experience) => (
            <Card key={experience.company} className="border-border/70">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{experience.role}</CardTitle>
                  <CardDescription>{experience.company}</CardDescription>
                </div>
                <Badge variant="muted">{experience.duration}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {experience.highlights.map((highlight) => (
                  <p key={highlight} className="text-sm text-muted-foreground">
                    • {highlight}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Core skills</CardTitle>
              <CardDescription>Signals that heavily influence the relevance model.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileData.skills.core.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Supporting skills</CardTitle>
              <CardDescription>Additional capabilities surfaced when matching specialized roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileData.skills.supporting.map((skill) => (
                <Badge key={skill} variant="muted">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Focus areas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileData.skills.focusAreas.map((area) => (
                <Badge key={area} variant="muted">
                  {area}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Work preferences</CardTitle>
              <CardDescription>Use these default parameters to tailor automation decisions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Preferred locations</p>
                <p className="text-base text-foreground">
                  {profileData.preferences.locations.join(", ")}
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Company size</p>
                <p className="text-base text-foreground">{profileData.preferences.companySize}</p>
              </div>
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Salary target</p>
                <p className="text-base text-foreground">{profileData.preferences.salaryRange}</p>
              </div>
              <div className="rounded-lg border border-dashed border-border/60 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Availability</p>
                <p className="text-base text-foreground">{profileData.preferences.startDate}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Documents on deck</CardTitle>
              <CardDescription>
                Track the latest resume variants, cover letters, and supporting artifacts prepared for
                automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex flex-col gap-2 rounded-lg border border-dashed border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.status}</p>
                  </div>
                  <Badge variant="muted">Updated {doc.lastUpdated}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
