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

interface VehicleType {
  id: number;
  name: string;
  type: string;
  description: string;
  rentalPrice: number | null;
  availability: boolean;
  capacity?: number;
  features?: any;
  co2EmissionsKg?: number;
  energyEfficiencyRating?: number;
  ecoScore?: number;
  transportUsages?: TransportUsage[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const vehicle = await prisma.vehicleType.findUnique({
      where: {
        id: parseInt(id)
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

    const usageData = vehicle.transportUsages || [];
    
    // Calculate averages
    const avgTravelTime = usageData.length > 0
      ? usageData.reduce((acc: number, curr: TransportUsage) => acc + curr.averageTravelTimeMin, 0) / usageData.length
      : 0;

    const avgUserCount = usageData.length > 0
      ? usageData.reduce((acc: number, curr: TransportUsage) => acc + curr.userCount, 0) / usageData.length
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
      type: vehicle.name, // Using name as type since we don't have a separate type field
      description: `Vehículo sostenible: ${vehicle.name}`, // Generate description from name
      rentalPrice: 0, // Default rental price
      availability: true, // Default availability
      capacity: 4, // Default capacity
      features: [], // Default empty features
      environmentalImpact: {
        co2EmissionsKg: 0,
        energyEfficiencyRating: 0,
        ecoScore: ecoScore // Using the calculated ecoScore
      },
      stats: {
        averageTravelTime: Math.round(avgTravelTime),
        averageUserCount: Math.round(avgUserCount),
        ecoScore,
        baseEcoScore
      },
      popularRoutes: popularRoutes.sort((a, b) => b.tripCount - a.tripCount),
      usageTrends: usageData.map((usage: TransportUsage) => ({
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