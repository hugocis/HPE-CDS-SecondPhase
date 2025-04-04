import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convertir los precios a céntimos (multiplicar por 100) para la consulta
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) * 100 : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) * 100 : undefined;
    const minEcoScore = searchParams.get('minEcoScore') ? Number(searchParams.get('minEcoScore')) : undefined;

    // Construir las condiciones de filtrado
    const conditions = [];

    // Filtrar por precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      conditions.push({
        occupancyData: {
          some: {
            AND: [
              ...(minPrice !== undefined ? [{ averagePricePerNight: { gte: minPrice } }] : []),
              ...(maxPrice !== undefined ? [{ averagePricePerNight: { lte: maxPrice } }] : [])
            ]
          }
        }
      });
    }

    // Filtrar por eco score
    if (minEcoScore !== undefined) {
      conditions.push({
        sustainabilityData: {
          some: {
            recyclingPercentage: { gte: minEcoScore }
          }
        }
      });
    }

    // Consulta final con ordenamiento correcto
    const hotels = await prisma.hotel.findMany({
      where: conditions.length > 0 ? { AND: conditions } : undefined,
      include: {
        occupancyData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        sustainabilityData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        reviews: {
          take: 3,
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    // Formatear los resultados
    const formattedHotels = hotels.map(hotel => {
      const sustainability = hotel.sustainabilityData[0];
      const occupancy = hotel.occupancyData[0];
      
      let ecoScore = 0;
      if (sustainability) {
        // Calculate eco score based on multiple factors
        const recyclingScore = sustainability.recyclingPercentage * 0.4; // 40% weight
        const energyScore = Math.min(100 - (sustainability.energyConsumptionKwh / 1000) * 10, 40); // 40% weight
        const wasteScore = Math.min(100 - (sustainability.wasteGeneratedKg / 100) * 20, 20); // 20% weight
        ecoScore = Math.round(recyclingScore + energyScore + wasteScore);
      }

      return {
        ...hotel,
        calculatedData: {
          ecoScore,
          pricePerNight: occupancy ? occupancy.averagePricePerNight / 100 : 0,
          availableRooms: occupancy ? Math.round((1 - occupancy.occupancyRate) * 100) : 0,
        }
      };
    });

    // Ordenar los hoteles por precio de manera ascendente
    const sortedHotels = [...formattedHotels].sort((a, b) => {
      const priceA = a.occupancyData[0]?.averagePricePerNight || 0;
      const priceB = b.occupancyData[0]?.averagePricePerNight || 0;
      return priceA - priceB;
    });

    // Aplicar filtros adicionales después del cálculo del eco score si es necesario
    const filteredHotels = sortedHotels.filter(hotel => {
      const meetsEcoScore = minEcoScore ? hotel.calculatedData.ecoScore >= minEcoScore : true;
      const meetsMinPrice = minPrice ? hotel.calculatedData.pricePerNight >= minPrice/100 : true;
      const meetsMaxPrice = maxPrice ? hotel.calculatedData.pricePerNight <= maxPrice/100 : true;
      
      return meetsEcoScore && meetsMinPrice && meetsMaxPrice;
    });

    return NextResponse.json(filteredHotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}