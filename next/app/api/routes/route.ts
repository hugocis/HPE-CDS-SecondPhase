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

      // Para rutas compuestas, extraer origen y destino del nombre
      let origin = null;
      let destination = null;
      if (!isSimpleRoute && nameParts.length >= 2) {
        origin = nameParts[0].trim();
        destination = nameParts[nameParts.length - 1].trim();
      }

      return {
        id: route.id,
        name: route.name,
        type: route.routeType || 'General',
        routeClass: isSimpleRoute ? 'simple' : 'composite',
        origin: origin,
        destination: destination,
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
      b.details.popularity - a.details.popularity
    );

    return new Response(JSON.stringify(sortedRoutes));
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load routes' }), { status: 500 });
  }
}