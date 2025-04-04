import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const maxDuration = searchParams.get('maxDuration') ? parseFloat(searchParams.get('maxDuration')!) : undefined;

    // Get all routes
    const routes = await prisma.route.findMany({
      where: {
        AND: [
          type && type !== 'all' ? {
            routeType: {
              equals: type // Búsqueda exacta del tipo
            }
          } : {},
          maxDuration ? { durationHr: { lte: maxDuration } } : {}
        ]
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
          take: 30
        }
      }
    });

    const formattedRoutes = routes.map(route => {
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
        (basePopularity * 0.5) +
        (Math.min(usagePopularity / 100, 1) * 50)
      );

      return {
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
        }
      };
    });

    // Sort routes by popularity by default
    const sortedRoutes = [...formattedRoutes].sort((a, b) => 
      (b.details.popularity || 0) - (a.details.popularity || 0)
    );

    return NextResponse.json(sortedRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}