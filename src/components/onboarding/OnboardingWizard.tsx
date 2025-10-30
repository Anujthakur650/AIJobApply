'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input, TextArea } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export type OnboardingProgressRecord = {
  userId: string;
  currentStep: number;
  completedSteps: number[] | null;
  profileCompletion: number;
  preferences: Record<string, unknown> | null;
};

export type OnboardingSnapshot = {
  score: number;
  breakdown: Record<string, number>;
};

export type OnboardingWizardProps = {
  progress: OnboardingProgressRecord;
  snapshot: OnboardingSnapshot;
  resumes: Array<{
    id: string;
    label: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
};

const steps = [
  {
    id: 1,
    title: 'Account verification',
    description: 'Confirm your email and secure your workspace.',
  },
  {
    id: 2,
    title: 'Upload resume',
    description: 'Add at least one resume to power automation.',
  },
  {
    id: 3,
    title: 'Complete profile',
    description: 'Add headline, summary, and experience highlights.',
  },
  {
    id: 4,
    title: 'Set preferences',
    description: 'Configure target roles, locations, and salary bands.',
  },
];

const parseCompleted = (values: number[] | null | unknown): number[] => {
  if (Array.isArray(values)) {
    return values.map((value) => Number(value)).filter((value) => Number.isInteger(value));
  }

  return [];
};

export default function OnboardingWizard({ progress, snapshot, resumes }: OnboardingWizardProps) {
  const [completedSteps, setCompletedSteps] = useState(
    new Set(parseCompleted(progress.completedSteps ?? []))
  );
  const [activeStep, setActiveStep] = useState(progress.currentStep ?? 1);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [preferences, setPreferences] = useState({
    remote: false,
    salary: '',
    locations: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const updateOnboarding = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Unable to update onboarding progress');
      }

      return response.json();
    },
  });

  const uploadResume = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', file.name);
      formData.append('isPrimary', 'true');

      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Unable to upload resume');
      }

      return response.json();
    },
  });

  const markStepComplete = (stepId: number) => {
    const updatedCompleted = new Set(completedSteps);
    updatedCompleted.add(stepId);

    updateOnboarding.mutate({
      step: Math.min(stepId + 1, steps.length),
      completedSteps: Array.from(updatedCompleted).sort((a, b) => a - b),
    });

    setCompletedSteps(updatedCompleted);
    setActiveStep(Math.min(stepId + 1, steps.length));
  };

  const handleProfileSave = () => {
    const updated = new Set(completedSteps);
    updated.add(activeStep);

    updateOnboarding.mutate({
      step: Math.min(activeStep + 1, steps.length),
      completedSteps: Array.from(updated).sort((a, b) => a - b),
    });
    setCompletedSteps(updated);
    setActiveStep(Math.min(activeStep + 1, steps.length));

    fetch(`/api/users/${progress.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          headline,
          summary,
        },
      }),
    }).catch(() => undefined);
  };

  const handlePreferencesSave = () => {
    const payload = {
      remotePreferred: preferences.remote,
      salaryRange: preferences.salary,
      locations: preferences.locations.split(',').map((item) => item.trim()).filter(Boolean),
    };

    const updated = new Set(completedSteps);
    updated.add(activeStep);

    updateOnboarding.mutate({
      step: Math.min(activeStep + 1, steps.length),
      completedSteps: Array.from(updated).sort((a, b) => a - b),
      preferences: payload,
    });

    setCompletedSteps(updated);
    setActiveStep(Math.min(activeStep + 1, steps.length));
  };

  const handleResumeSubmit = () => {
    if (!resumeFile) {
      return;
    }

    uploadResume.mutate(resumeFile, {
      onSuccess: () => {
        markStepComplete(2);
        setResumeFile(null);
      },
    });
  };

  const currentStep = steps.find((step) => step.id === activeStep) ?? steps[0];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Onboarding</h1>
        <p className="text-sm text-slate-500">
          Complete the guided wizard to unlock automation, matching, and analytics across your job search lifecycle.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Overall progress</p>
            <Progress value={snapshot.score} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => markStepComplete(activeStep)}>
            Skip step
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {steps.map((step) => {
            const status = step.id === activeStep ? 'active' : completed.has(step.id) ? 'done' : 'pending';
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex flex-col rounded-xl border px-4 py-3 text-left transition ${
                  status === 'active'
                    ? 'border-[var(--primary)] bg-blue-50'
                    : status === 'done'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
                title={step.description}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {step.id}</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{step.title}</span>
                <span className="text-xs text-slate-500">{step.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader
            title={currentStep.title}
            description={currentStep.description}
            action={<Badge tone="info">Step {currentStep.id} of {steps.length}</Badge>}
          />
          <CardContent className="space-y-4">
            {currentStep.id === 1 ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p>1. Open your inbox and verify the welcome email. Need a fresh link? Head to the verification page.</p>
                <p>2. Enable two-factor authentication in your provider for enhanced security.</p>
                <Button asChild variant="secondary" size="sm">
                  <a href="/verify">Resend verification</a>
                </Button>
              </div>
            ) : null}

            {currentStep.id === 2 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500" htmlFor="resume">Upload resume</label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <Button
                  variant="primary"
                  disabled={!resumeFile}
                  loading={uploadResume.isLoading}
                  onClick={handleResumeSubmit}
                >
                  Upload and continue
                </Button>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Existing resumes</p>
                  {resumes.length === 0 ? (
                    <p className="text-xs text-slate-400">No resumes uploaded yet.</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-500">
                      {resumes.map((resume) => (
                        <li key={resume.id}>
                          {resume.label} · {resume.isPrimary ? 'Primary' : 'Secondary'} · {new Date(resume.createdAt).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}

            {currentStep.id === 3 ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500" htmlFor="headline">Headline</label>
                  <Input
                    id="headline"
                    value={headline}
                    placeholder="Automation Lead, AIJobApply"
                    onChange={(event) => setHeadline(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500" htmlFor="summary">Summary</label>
                  <TextArea
                    id="summary"
                    rows={5}
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Summarise your domain expertise, standout achievements, and career goals."
                  />
                </div>
                <Button variant="primary" onClick={handleProfileSave} loading={updateOnboarding.isLoading}>
                  Save profile
                </Button>
              </div>
            ) : null}

            {currentStep.id === 4 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="remote"
                    type="checkbox"
                    checked={preferences.remote}
                    onChange={(event) => setPreferences((prev) => ({ ...prev, remote: event.target.checked }))}
                  />
                  <label htmlFor="remote" className="text-sm text-slate-600">Prefer remote roles</label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500" htmlFor="salary">Target salary (USD)</label>
                  <Input
                    id="salary"
                    value={preferences.salary}
                    onChange={(event) => setPreferences((prev) => ({ ...prev, salary: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500" htmlFor="locations">Preferred locations</label>
                  <Input
                    id="locations"
                    value={preferences.locations}
                    placeholder="Remote, Austin, TX"
                    onChange={(event) => setPreferences((prev) => ({ ...prev, locations: event.target.value }))}
                  />
                </div>
                <Button variant="primary" onClick={handlePreferencesSave} loading={updateOnboarding.isLoading}>
                  Save preferences
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
