import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface TransportUsage {
  date: Date;
  userCount: number;
  averageTravelTimeMin: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicleType.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        transportUsages: {
          orderBy: {
            date: 'desc'
          },
          take: 30 // Last 30 records for statistics
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const usageData = vehicle.transportUsages;
    
    // Calculate average travel time
    const avgTravelTime = usageData.length > 0
      ? usageData.reduce((acc: number, curr: TransportUsage) => acc + curr.averageTravelTimeMin, 0) / usageData.length
      : 0;

    // Calculate average user count (popularity)
    const avgUserCount = usageData.length > 0
      ? usageData.reduce((acc: number, curr: TransportUsage) => acc + curr.userCount, 0) / usageData.length
      : 0;

    // Calculate eco score based on average travel time and usage
    const ecoScore = Math.min(
      Math.round((1 - (avgTravelTime / 120)) * 50 + // Lower travel time is better (max 50 points)
      (avgUserCount / 1000) * 50) // Higher usage means more shared transportation (max 50 points)
    , 100);

    // Get usage trends
    const usageTrends = usageData.map((usage: TransportUsage) => ({
      date: usage.date,
      userCount: usage.userCount,
      averageTravelTimeMin: usage.averageTravelTimeMin
    }));

    const formattedVehicle = {
      id: vehicle.id,
      name: vehicle.name,
      stats: {
        averageTravelTime: Math.round(avgTravelTime),
        averageUserCount: Math.round(avgUserCount),
        ecoScore
      },
      usageTrends
    };

    return NextResponse.json(formattedVehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    );
  }
}