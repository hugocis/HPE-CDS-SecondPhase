import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        occupancyData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        sustainabilityData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        reviews: {
          take: 3,
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}