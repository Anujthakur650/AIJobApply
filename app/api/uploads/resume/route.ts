import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resumeUploadSchema } from '@/lib/validators';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

const extractEmail = (text: string) =>
  text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;

const extractPhone = (text: string) =>
  text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? null;

function normalizeText(value: string) {
  return value.replace(/\r/g, '');
}

function parseResume(text: string) {
  const normalized = normalizeText(text);

  const sections = normalized.split(/\n{2,}/).map((section) => section.trim());
  const summary = sections[0] ?? '';

  const skillsSection = sections.find((section) => /skills?/i.test(section));
  const skills = skillsSection
    ? skillsSection
        .replace(/skills?:/i, '')
        .split(/[•\n,]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const experienceSection = sections.filter((section) => /experience|employment|work history/i.test(section));
  const educationSection = sections.filter((section) => /education|certification|coursework/i.test(section));

  return {
    contact: {
      email: extractEmail(normalized),
      phone: extractPhone(normalized)
    },
    summary,
    skills,
    workHistory: experienceSection,
    education: educationSection
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    const title = typeof formData.get('title') === 'string' ? formData.get('title') : undefined;
    const notes = typeof formData.get('notes') === 'string' ? formData.get('notes') : undefined;

    const metadata = resumeUploadSchema.safeParse({ title, notes });

    if (!metadata.success) {
      return NextResponse.json({ errors: metadata.error.flatten() }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.mkdir(UPLOAD_ROOT, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(UPLOAD_ROOT, fileName);

    await fs.writeFile(filePath, buffer);

    let extractedText = '';

    try {
      extractedText = await file.text();
    } catch (error) {
      console.warn('[RESUME_PARSE]', 'Unable to read file as text', error);
    }

    const parsed = extractedText ? parseResume(extractedText) : undefined;

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        name: metadata.data.title ?? file.name,
        type: file.type || 'application/octet-stream',
        size: buffer.byteLength,
        url: `/uploads/${fileName}`,
        parsedText: extractedText || null
      }
    });

    return NextResponse.json(
      {
        document,
        parsed
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[RESUME_UPLOAD_POST]', error);
    return NextResponse.json({ error: 'Unable to process resume upload.' }, { status: 500 });
  }
}
