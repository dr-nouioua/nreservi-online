import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const workerId = searchParams.get('workerId');

    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (workerId) {
      where.workerId = workerId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            wilaya: true,
            commune: true,
          },
        },
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to frontend type
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      workerId: app.workerId,
      workerName: app.worker.name,
      workerPhone: app.worker.phone,
      workerRate: Number(app.workerRate),
      workerRateUnit: app.workerRateUnit,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));

    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, workerId, workerName, workerPhone, workerRate, workerRateUnit } = body;

    if (!jobId || !workerId || !workerName || !workerPhone || !workerRate || !workerRateUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_workerId: {
          jobId,
          workerId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 409 },
      );
    }

    // Create application and increment job's applicant count
    const [application] = await prisma.$transaction([
      prisma.application.create({
        data: {
          jobId,
          workerId,
          workerName,
          workerPhone,
          workerRate: workerRate,
          workerRateUnit,
        },
      }),
      prisma.jobPost.update({
        where: { id: jobId },
        data: {
          applicantsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
