import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verificar si el usuario ya tiene una wallet
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { walletAddress: true }
    });

    if (existingUser?.walletAddress) {
      return NextResponse.json({
        success: true,
        address: existingUser.walletAddress
      });
    }

    // Crear nueva wallet
    const response = await fetch('http://localhost:3001/api/users/create-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: session.user.email,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create wallet');
    }

    // Actualizar el usuario con la nueva wallet
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        walletAddress: data.address,
        privateKey: data.privateKey,
      },
    });

    return NextResponse.json({
      success: true,
      address: data.address
    });
  } catch (error) {
    console.error('Error in POST /api/users/create-wallet:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}