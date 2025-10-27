import { PrismaClient, EmploymentType, WorkMode, JobSource, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@applyflow.ai' },
    update: {},
    create: {
      email: 'demo@applyflow.ai',
      name: 'Demo Candidate',
      hashedPassword: passwordHash,
      profile: {
        create: {
          headline: 'Senior Frontend Engineer',
          summary:
            'Front-end engineer with 8+ years of experience building highly-performant SaaS platforms across fintech and productivity verticals.',
          phone: '+1 (555) 010-5678',
          location: 'Remote — Austin, TX',
          linkedin: 'https://linkedin.com/in/demo-candidate',
          github: 'https://github.com/democandidate',
          portfolio: 'https://demo-portfolio.com',
          yearsOfExperience: 8,
          profileScore: 78
        }
      },
      preferences: {
        create: {
          employmentType: [EmploymentType.FULL_TIME],
          workModes: [WorkMode.REMOTE, WorkMode.HYBRID],
          locations: ['Remote', 'Austin, TX', 'New York, NY'],
          industries: ['SaaS', 'Productivity', 'Fintech'],
          companySizes: ['50-200', '200-500'],
          keywords: ['Frontend', 'React', 'Staff Engineer'],
          salaryMin: 140000,
          salaryMax: 190000,
          remoteOnly: false
        }
      },
      experiences: {
        create: [
          {
            company: 'Velocity Systems',
            title: 'Senior Frontend Engineer',
            startDate: new Date('2020-03-01'),
            current: true,
            location: 'Remote',
            achievements: ['Led adoption of design system', 'Improved application conversion by 18%'],
            description:
              'Drove end-to-end delivery of core features across an enterprise automation suite using React, GraphQL, and Node.js.'
          },
          {
            company: 'Nimbus Labs',
            title: 'Frontend Engineer',
            startDate: new Date('2017-06-01'),
            endDate: new Date('2020-02-01'),
            current: false,
            location: 'Austin, TX',
            achievements: ['Implemented accessibility upgrades', 'Mentored junior engineers'],
            description: 'Owned UI architecture and reusable component library for analytics dashboards.'
          }
        ]
      },
      educations: {
        create: [
          {
            school: 'University of Texas at Austin',
            degree: 'B.S. Computer Science',
            field: 'Human Computer Interaction',
            startDate: new Date('2012-08-01'),
            endDate: new Date('2016-05-01')
          }
        ]
      }
    }
  });

  const skillNames = [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'GraphQL',
    'Tailwind CSS',
    'AWS'
  ];

  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: {
          name,
          category: 'Engineering'
        }
      })
    )
  );

  await prisma.skillOnUser.createMany({
    data: skills.map((skill) => ({
      userId: user.id,
      skillId: skill.id
    })),
    skipDuplicates: true
  });

  const jobPostings = await Promise.all([
    prisma.jobPosting.upsert({
      where: { externalId: 'linkedin-123' },
      update: {},
      create: {
        externalId: 'linkedin-123',
        title: 'Staff Frontend Engineer',
        company: 'LaunchPad',
        description:
          'As a Staff Frontend Engineer you will design modern interfaces, partner with product to deliver features, and mentor the broader frontend guild.',
        location: 'Remote - US',
        source: JobSource.LINKEDIN,
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.REMOTE,
        salaryMin: 160000,
        salaryMax: 210000,
        currency: 'USD',
        remote: true,
        url: 'https://www.linkedin.com/jobs/view/123',
        postedAt: new Date(),
        relevanceScore: 91
      }
    }),
    prisma.jobPosting.upsert({
      where: { externalId: 'indeed-567' },
      update: {},
      create: {
        externalId: 'indeed-567',
        title: 'Senior React Engineer',
        company: 'Flowstate',
        description:
          'Join Flowstate to build high-impact product experiences for thousands of knowledge workers. We value craftsmanship and velocity.',
        location: 'Austin, TX',
        source: JobSource.INDEED,
        employmentType: EmploymentType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        salaryMin: 150000,
        salaryMax: 185000,
        currency: 'USD',
        remote: false,
        url: 'https://www.indeed.com/viewjob?jk=567',
        postedAt: new Date(),
        relevanceScore: 82
      }
    })
  ]);

  await prisma.skillOnJobPosting.createMany({
    data: jobPostings.flatMap((job) =>
      skills.slice(0, 4).map((skill, index) => ({
        jobPostingId: job.id,
        skillId: skill.id,
        importance: index >= 2 ? 2 : 3
      }))
    ),
    skipDuplicates: true
  });

  await Promise.all([
    prisma.application.upsert({
      where: { id: 'demo-application-1' },
      update: {
        status: ApplicationStatus.SUBMITTED,
        appliedAt: new Date(),
        responseAt: null
      },
      create: {
        id: 'demo-application-1',
        userId: user.id,
        jobPostingId: jobPostings[0].id,
        status: ApplicationStatus.SUBMITTED,
        appliedAt: new Date()
      }
    }),
    prisma.application.upsert({
      where: { id: 'demo-application-2' },
      update: {
        status: ApplicationStatus.INTERVIEW,
        appliedAt: new Date(),
        responseAt: new Date()
      },
      create: {
        id: 'demo-application-2',
        userId: user.id,
        jobPostingId: jobPostings[1].id,
        status: ApplicationStatus.INTERVIEW,
        appliedAt: new Date(),
        responseAt: new Date()
      }
    })
  ]);

  console.log('Database seeded with demo data.');
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
