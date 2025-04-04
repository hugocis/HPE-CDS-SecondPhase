import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicleType.findMany({
      include: {
        transportUsages: {
          orderBy: {
            date: 'desc'
          },
          take: 30 // Last 30 records for statistics
        }
      }
    });

    const formattedVehicles = vehicles.map(vehicle => {
      const usageData = vehicle.transportUsages;
      
      // Calculate average travel time
      const avgTravelTime = usageData.length > 0
        ? usageData.reduce((acc: number, curr: any) => acc + curr.averageTravelTimeMin, 0) / usageData.length
        : 0;

      // Calculate average user count (popularity)
      const avgUserCount = usageData.length > 0
        ? usageData.reduce((acc: number, curr: any) => acc + curr.userCount, 0) / usageData.length
        : 0;

      // Calculate eco score based on average travel time and usage
      const ecoScore = Math.min(
        Math.round((1 - (avgTravelTime / 120)) * 50 + // Lower travel time is better (max 50 points)
        (avgUserCount / 1000) * 50) // Higher usage means more shared transportation (max 50 points)
      , 100);

      return {
        id: vehicle.id,
        name: vehicle.name,
        stats: {
          averageTravelTime: Math.round(avgTravelTime),
          averageUserCount: Math.round(avgUserCount),
          ecoScore
        }
      };
    });

    return NextResponse.json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}