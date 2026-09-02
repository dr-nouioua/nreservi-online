import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const wilaya = searchParams.get('wilaya');
    const search = searchParams.get('search');
    const recruiterId = searchParams.get('recruiterId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (wilaya) {
      where.wilaya = wilaya;
    }

    if (recruiterId) {
      where.recruiterId = recruiterId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              recruiterProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.jobPost.count({ where }),
    ]);

    // Transform jobs to match frontend type
    const transformedJobs = jobs.map((job) => ({
      id: job.id,
      recruiterId: job.recruiterId,
      recruiterName: job.recruiter.name,
      companyName: job.recruiter.recruiterProfile?.companyName || 'Unknown',
      title: job.title,
      description: job.description,
      wilaya: job.wilaya,
      commune: job.commune,
      duration: job.duration,
      budgetAmount: Number(job.budgetAmount),
      budgetUnit: job.budgetUnit,
      paymentType: job.paymentType,
      status: job.status,
      applicantsCount: job._count.applications,
      createdAt: job.createdAt.toISOString(),
      tags: job.tags,
    }));

    return NextResponse.json({ jobs: transformedJobs, total });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recruiterId,
      title,
      description,
      wilaya,
      commune,
      duration,
      budgetAmount,
      budgetUnit,
      paymentType,
      tags,
    } = body;

    if (!recruiterId || !title || !description || !wilaya || !commune || !duration || !budgetAmount || !budgetUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const job = await prisma.jobPost.create({
      data: {
        recruiterId,
        title,
        description,
        wilaya,
        commune,
        duration,
        budgetAmount: budgetAmount,
        budgetUnit,
        paymentType: paymentType || 'cash',
        tags: tags || [],
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
