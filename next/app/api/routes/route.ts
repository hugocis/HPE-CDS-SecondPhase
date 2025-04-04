import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const routeClass = searchParams.get('routeClass');
    const maxDuration = searchParams.get('maxDuration') ? parseFloat(searchParams.get('maxDuration')!) : undefined;

    // First get all routes to determine their class
    const routes = await prisma.route.findMany({
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

      // Calculate popularity
      const basePopularity = route.popularity || 0;
      const usagePopularity = route.transportUsages.length > 0
        ? route.transportUsages.reduce((acc, curr) => acc + curr.userCount, 0) / route.transportUsages.length
        : 0;
      
      const popularityScore = Math.round(
        (basePopularity * 0.5) + 
        (Math.min(usagePopularity / 100, 1) * 50)
      );

      // Determine if route is simple or composite by name pattern
      const nameParts = route.name.split(' - ');
      const isSimpleRoute = nameParts.length === 2 && !isNaN(Number(nameParts[1]));

      return {
        id: route.id,
        name: route.name,
        type: route.routeType || 'General',
        routeClass: isSimpleRoute ? 'simple' : 'composite',
        details: {
          lengthKm: route.lengthKm ? route.lengthKm / 10 : null,
          durationHr: route.durationHr ? route.durationHr / 10 : null,
          popularity: popularityScore
        },
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews: route.reviews.length,
          recentUsage: route.transportUsages.length
        }
      };
    });

    // Apply filters
    let filteredRoutes = formattedRoutes;

    if (type && type !== 'all') {
      filteredRoutes = filteredRoutes.filter(route => route.type === type);
    }

    if (routeClass && routeClass !== 'all') {
      filteredRoutes = filteredRoutes.filter(route => route.routeClass === routeClass);
    }

    if (maxDuration) {
      filteredRoutes = filteredRoutes.filter(route => 
        route.details.durationHr !== null && route.details.durationHr <= maxDuration
      );
    }

    // Sort by popularity
    const sortedRoutes = [...filteredRoutes].sort((a, b) => 
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