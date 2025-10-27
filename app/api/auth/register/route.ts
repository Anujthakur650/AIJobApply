import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        profile: {
          create: {}
        },
        preferences: {
          create: {
            employmentType: [],
            workModes: [],
            locations: [],
            industries: [],
            companySizes: [],
            keywords: []
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return NextResponse.json({ error: 'Unable to create account, please try again.' }, { status: 500 });
  }
}
