import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface TransportUsage {
  id: number;
  date: Date;
  userCount: number;
  averageTravelTimeMin: number;
  popularRouteId: number | null;
  popularRoute: {
    id: number;
    name: string;
    routeType: string | null;
    lengthKm: number | null;
    durationHr: number | null;
    popularity: number | null;
  } | null;
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
          take: 30,
          include: {
            popularRoute: true
          }
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
    
    // Calculate averages
    const avgTravelTime = usageData.length > 0
      ? usageData.reduce((acc: number, curr) => acc + curr.averageTravelTimeMin, 0) / usageData.length
      : 0;

    const avgUserCount = usageData.length > 0
      ? usageData.reduce((acc: number, curr) => acc + curr.userCount, 0) / usageData.length
      : 0;

    // Get base eco score for vehicle type based on name
    const baseEcoScore = {
      'Tranvía': 95,
      'Bicicleta': 100,
      'Autobús': 85,
      'Metro': 90,
      'Taxi': 50,
      'Coche Compartido': 65
    }[vehicle.name] || 60;

    // Adjust bonuses to have less impact
    // Usage bonus (up to 5 points)
    const usageBonus = Math.min((avgUserCount / 100) * 2.5, 5);
    
    // Time bonus (up to 5 points)
    const timeBonus = Math.min((1 - (avgTravelTime / 120)) * 5, 5);

    // Final eco score
    const ecoScore = Math.min(Math.round(baseEcoScore + usageBonus + timeBonus), 100);

    // Get popular routes
    const routeStats = usageData.reduce((acc: any, usage: TransportUsage) => {
      const routeName = usage.popularRoute?.name || 'Unknown Route';
      if (!acc[routeName]) {
        acc[routeName] = {
          count: 0,
          totalUsers: 0,
          totalTime: 0
        };
      }
      acc[routeName].count++;
      acc[routeName].totalUsers += usage.userCount;
      acc[routeName].totalTime += usage.averageTravelTimeMin;
      return acc;
    }, {});

    const popularRoutes = Object.entries(routeStats).map(([name, stats]: [string, any]) => ({
      name,
      tripCount: stats.count,
      averageUsers: Math.round(stats.totalUsers / stats.count),
      averageTravelTime: Math.round(stats.totalTime / stats.count)
    }));

    // Format vehicle data
    const formattedVehicle = {
      id: vehicle.id,
      name: vehicle.name,
      stats: {
        averageTravelTime: Math.round(avgTravelTime),
        averageUserCount: Math.round(avgUserCount),
        ecoScore,
        baseEcoScore
      },
      popularRoutes: popularRoutes.sort((a, b) => b.tripCount - a.tripCount),
      usageTrends: usageData.map((usage) => ({
        date: usage.date,
        userCount: usage.userCount,
        averageTravelTimeMin: usage.averageTravelTimeMin
      }))
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