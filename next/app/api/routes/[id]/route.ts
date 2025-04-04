import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const route = await prisma.route.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        reviews: {
          orderBy: {
            date: 'desc'
          }
        },
        transportUsages: {
          orderBy: {
            date: 'desc'
          },
          take: 30,
          include: {
            vehicleType: true
          }
        }
      }
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = route.reviews.length > 0
      ? route.reviews.reduce((acc, curr) => acc + curr.rating, 0) / route.reviews.length
      : 0;

    // Calculate popularity score
    const basePopularity = route.popularity || 0;
    const usagePopularity = route.transportUsages.length > 0
      ? route.transportUsages.reduce((acc, curr) => acc + curr.userCount, 0) / route.transportUsages.length
      : 0;
    
    const popularityScore = Math.round(
      (basePopularity * 0.5) + // Base popularity weight
      (Math.min(usagePopularity / 100, 1) * 50) // Recent usage weight (normalized to 0-50)
    );

    // Group transport usage by vehicle type
    const transportStats = route.transportUsages.reduce((acc, usage) => {
      const vehicleType = usage.vehicleType.name;
      if (!acc[vehicleType]) {
        acc[vehicleType] = {
          count: 0,
          totalUsers: 0,
          avgTravelTime: 0
        };
      }
      acc[vehicleType].count++;
      acc[vehicleType].totalUsers += usage.userCount;
      acc[vehicleType].avgTravelTime += usage.averageTravelTimeMin;
      return acc;
    }, {} as Record<string, { count: number; totalUsers: number; avgTravelTime: number; }>);

    // Calculate averages for each vehicle type
    const vehicleUsage = Object.entries(transportStats).map(([vehicle, stats]) => ({
      vehicleType: vehicle,
      usageCount: stats.count,
      averageUsers: Math.round(stats.totalUsers / stats.count),
      averageTravelTime: Math.round(stats.avgTravelTime / stats.count)
    }));

    const formattedRoute = {
      id: route.id,
      name: route.name,
      type: route.routeType || 'General',
      details: {
        lengthKm: route.lengthKm,
        durationHr: route.durationHr,
        popularity: popularityScore
      },
      stats: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: route.reviews.length,
        recentUsage: route.transportUsages.length
      },
      transportUsage: vehicleUsage,
      reviews: route.reviews.map(review => ({
        id: review.id,
        date: review.date,
        rating: review.rating,
        comment: review.comment,
        language: review.language
      }))
    };

    return NextResponse.json(formattedRoute);
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch route details' },
      { status: 500 }
    );
  }
}