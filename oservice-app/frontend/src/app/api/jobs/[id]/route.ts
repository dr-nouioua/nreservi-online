import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            recruiterProfile: {
              select: {
                companyName: true,
                companyDescription: true,
                wilaya: true,
                commune: true,
              },
            },
          },
        },
        applications: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                phone: true,
                workerProfile: {
                  select: {
                    title: true,
                    skills: true,
                    rateAmount: true,
                    rateUnit: true,
                    rating: true,
                    completedJobs: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 },
      );
    }

    // Transform to frontend type
    const transformedJob = {
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
      applications: job.applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        workerId: app.workerId,
        workerName: app.worker.name,
        workerPhone: app.worker.phone,
        workerRate: Number(app.workerRate),
        workerRateUnit: app.workerRateUnit,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ job: transformedJob });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const job = await prisma.jobPost.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.jobPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
