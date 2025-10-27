'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ProfileResponse = {
  profile: {
    headline?: string | null;
    summary?: string | null;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
    yearsOfExperience?: number | null;
    profileScore?: number | null;
  } | null;
  preferences: {
    employmentType: string[];
    workModes: string[];
    locations: string[];
    industries: string[];
    companySizes: string[];
    keywords: string[];
    salaryMin?: number | null;
    salaryMax?: number | null;
    remoteOnly?: boolean;
  } | null;
  skills: Array<{
    name: string;
    seniority?: string | null;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    location?: string | null;
  }>;
  profileScore: number;
};

interface ProfileFormValues {
  headline: string;
  summary: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
  yearsOfExperience: string;
  employmentType: string[];
  workModes: string[];
  locations: string;
  industries: string;
  companySizes: string;
  keywords: string;
  salaryMin: string;
  salaryMax: string;
  remoteOnly: boolean;
  skills: string;
}

const EMPLOYMENT_OPTIONS = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Temporary', value: 'TEMPORARY' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Freelance', value: 'FREELANCE' }
];

const WORK_MODES = [
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'Onsite', value: 'ONSITE' }
];

const parseList = (value: string) =>
  value
    .split(/,|\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      return response.json();
    }
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isSubmitting }
  } = useForm<ProfileFormValues>({
    defaultValues: {
      headline: '',
      summary: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: '',
      yearsOfExperience: '',
      employmentType: [],
      workModes: [],
      locations: '',
      industries: '',
      companySizes: '',
      keywords: '',
      salaryMin: '',
      salaryMax: '',
      remoteOnly: false,
      skills: ''
    }
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    reset({
      headline: data.profile?.headline ?? '',
      summary: data.profile?.summary ?? '',
      phone: data.profile?.phone ?? '',
      location: data.profile?.location ?? '',
      website: data.profile?.website ?? '',
      linkedin: data.profile?.linkedin ?? '',
      github: data.profile?.github ?? '',
      portfolio: data.profile?.portfolio ?? '',
      yearsOfExperience: data.profile?.yearsOfExperience?.toString() ?? '',
      employmentType: data.preferences?.employmentType ?? [],
      workModes: data.preferences?.workModes ?? [],
      locations: data.preferences?.locations?.join(', ') ?? '',
      industries: data.preferences?.industries?.join(', ') ?? '',
      companySizes: data.preferences?.companySizes?.join(', ') ?? '',
      keywords: data.preferences?.keywords?.join(', ') ?? '',
      salaryMin: data.preferences?.salaryMin?.toString() ?? '',
      salaryMax: data.preferences?.salaryMax?.toString() ?? '',
      remoteOnly: data.preferences?.remoteOnly ?? false,
      skills: data.skills.map((skill) => skill.name).join(', ')
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const payload = {
        profile: {
          headline: values.headline || null,
          summary: values.summary || null,
          phone: values.phone || null,
          location: values.location || null,
          website: values.website || null,
          linkedin: values.linkedin || null,
          github: values.github || null,
          portfolio: values.portfolio || null,
          yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : null
        },
        preferences: {
          employmentType: values.employmentType,
          workModes: values.workModes,
          locations: parseList(values.locations),
          industries: parseList(values.industries),
          companySizes: parseList(values.companySizes),
          keywords: parseList(values.keywords),
          salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
          salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
          remoteOnly: values.remoteOnly
        },
        skills: parseList(values.skills).map((name) => ({ name }))
      };

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Unable to update profile');
      }

      return response.json();
    },
    onSuccess: (updated) => {
      toast.success('Profile updated');
      queryClient.setQueryData<ProfileResponse>(['profile'], updated);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update profile';
      toast.error(message);
    }
  });

  const employmentType = watch('employmentType');
  const workModes = watch('workModes');

  const toggleValue = (field: 'employmentType' | 'workModes', value: string) => {
    const current = field === 'employmentType' ? employmentType : workModes;
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

    if (field === 'employmentType') {
      setValue('employmentType', next, { shouldDirty: true });
    } else {
      setValue('workModes', next, { shouldDirty: true });
    }
  };

  const onSubmit = (values: ProfileFormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Professional profile</h1>
          <p className="text-sm text-muted-foreground">
            Keep your information current to unlock higher quality job matches and tailored cover letters.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-secondary" /> Profile completeness: {data?.profileScore ?? 0}%
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Professional summary</CardTitle>
              <CardDescription>
                This information feeds resume parsing, cover letter generation, and recruiter-facing profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" placeholder="Senior Frontend Engineer" {...register('headline')} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" placeholder="Short narrative about your expertise" rows={5} {...register('summary')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 010-1234" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Austin, TX" {...register('location')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of experience</Label>
                <Input id="yearsOfExperience" type="number" min={0} {...register('yearsOfExperience')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://portfolio.com" {...register('website')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/you" {...register('linkedin')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" placeholder="https://github.com/you" {...register('github')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input id="portfolio" placeholder="https://dribbble.com/you" {...register('portfolio')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences & targeting</CardTitle>
              <CardDescription>Inform the matching engine about your ideal roles and work conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-semibold text-foreground">Employment type</Label>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {EMPLOYMENT_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-border"
                        checked={employmentType.includes(option.value)}
                        onChange={() => toggleValue('employmentType', option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground">Work arrangement</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WORK_MODES.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-border"
                        checked={workModes.includes(option.value)}
                        onChange={() => toggleValue('workModes', option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="locations">Preferred locations</Label>
                  <Input id="locations" placeholder="Remote, Austin, TX, New York, NY" {...register('locations')} />
                  <p className="text-xs text-muted-foreground">Separate multiple locations with commas.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industries">Industries</Label>
                  <Input id="industries" placeholder="Fintech, Productivity, SaaS" {...register('industries')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySizes">Company size</Label>
                  <Input id="companySizes" placeholder="50-200, 200-500" {...register('companySizes')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Role keywords</Label>
                  <Input id="keywords" placeholder="Staff Engineer, Frontend" {...register('keywords')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary minimum (USD)</Label>
                  <Input id="salaryMin" type="number" min={0} step={1000} {...register('salaryMin')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salary maximum (USD)</Label>
                  <Input id="salaryMax" type="number" min={0} step={1000} {...register('salaryMax')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Remote only</Label>
                  <Controller
                    name="remoteOnly"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-border"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        I prefer remote roles only
                      </label>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key skills</CardTitle>
              <CardDescription>
                Add core technologies and capabilities. Separate multiple skills with commas to inform matching accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea id="skills" rows={4} placeholder="React, TypeScript, Design Systems" {...register('skills')} />
            </CardContent>
          </Card>

          {data?.experiences?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Work history</CardTitle>
                <CardDescription>Experiences parsed from your resume and stored for reference.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.experiences.map((experience) => (
                  <div key={experience.id} className="rounded-xl border border-border bg-white/80 p-4">
                    <p className="text-sm font-semibold text-foreground">{experience.title}</p>
                    <p className="text-xs text-muted-foreground">{experience.company}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(experience.startDate).toLocaleDateString()} —{' '}
                      {experience.current
                        ? 'Present'
                        : experience.endDate
                        ? new Date(experience.endDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    {experience.location && (
                      <p className="text-xs text-muted-foreground">{experience.location}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={!isDirty || isSubmitting || mutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
