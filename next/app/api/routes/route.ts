import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const routeClass = searchParams.get('routeClass');
    const maxDuration = searchParams.get('maxDuration') ? parseFloat(searchParams.get('maxDuration')!) : undefined;

    // Primero obtenemos todas las rutas para poder detectar su clase
    const routes = await prisma.route.findMany({
      where: {
        AND: [
          type && type !== 'all' ? {
            routeType: {
              equals: type
            }
          } : {},
          maxDuration ? { durationHr: { lte: maxDuration * 10 } } : {}
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
      // Calculamos el rating promedio
      const averageRating = route.reviews.length > 0
        ? route.reviews.reduce((acc, curr) => acc + curr.rating, 0) / route.reviews.length
        : 0;

      // Calculamos la popularidad
      const basePopularity = route.popularity || 0;
      const usagePopularity = route.transportUsages.length > 0
        ? route.transportUsages.reduce((acc, curr) => acc + curr.userCount, 0) / route.transportUsages.length
        : 0;
      
      const popularityScore = Math.round(
        (basePopularity * 0.5) + 
        (Math.min(usagePopularity / 100, 1) * 50)
      );

      // Determinamos si es una ruta simple o compuesta por el patrón del nombre
      const nameParts = route.name.split(' - ');
      const isSimpleRoute = nameParts.length === 2 && !isNaN(Number(nameParts[1]));

      // Solo incluimos la ruta si coincide con el filtro de clase seleccionado
      const routeClass = searchParams.get('routeClass');
      if (routeClass && routeClass !== 'all') {
        const matchesClass = (routeClass === 'simple') === isSimpleRoute;
        if (!matchesClass) {
          return null;
        }
      }

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
    }).filter(route => route !== null);

    // Ordenar por popularidad
    const sortedRoutes = [...formattedRoutes].sort((a, b) => 
      (b!.details.popularity || 0) - (a!.details.popularity || 0)
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