import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'oservice-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, role } = await request.json();

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: role,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered for this role' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role,
        isApproved: role === 'worker',
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    response.cookies.set('oservice_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
