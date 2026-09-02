import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get recruiter profile error:', error);
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
      userId,
      companyName,
      companyDescription,
      wilaya,
      commune,
    } = body;

    if (!userId || !companyName || !wilaya || !commune) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // Update existing profile
      const profile = await prisma.recruiterProfile.update({
        where: { userId },
        data: {
          companyName,
          companyDescription,
          wilaya,
          commune,
        },
      });
      return NextResponse.json({ profile });
    }

    // Create new profile
    const profile = await prisma.recruiterProfile.create({
      data: {
        userId,
        companyName,
        companyDescription,
        wilaya,
        commune,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Create recruiter profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
