import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Base eco scores for different vehicle types
const baseEcoScores: { [key: string]: number } = {
  'Tranvía': 95,
  'Bicicleta': 100,
  'Autobús': 85,
  'Metro': 90,
  'Taxi': 50,
  'Coche Compartido': 65
};

export async function GET() {
  try {
    const vehicles = await prisma.vehicleType.findMany({
      include: {
        transportUsages: {
          orderBy: {
            date: 'desc'
          },
          take: 30
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

      // Get base eco score for vehicle type
      const baseEcoScore = baseEcoScores[vehicle.name] || 60;

      // Usage efficiency bonus (up to 5 points)
      const usageBonus = Math.min((avgUserCount / 100) * 2.5, 5);
      
      // Time efficiency bonus (up to 5 points)
      const timeBonus = Math.min((1 - (avgTravelTime / 120)) * 5, 5);

      // Final eco score
      const ecoScore = Math.min(Math.round(baseEcoScore + usageBonus + timeBonus), 100);

      return {
        id: vehicle.id,
        name: vehicle.name,
        stats: {
          averageTravelTime: Math.round(avgTravelTime),
          averageUserCount: Math.round(avgUserCount),
          ecoScore,
          baseEcoScore
        }
      };
    });

    // Sort vehicles by eco score
    const sortedVehicles = formattedVehicles.sort((a, b) => b.stats.ecoScore - a.stats.ecoScore);

    return NextResponse.json(sortedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}