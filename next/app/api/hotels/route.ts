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
        const recyclingScore = (sustainability.recyclingPercentage / 100) * 40;
        const energyScore = Math.min(100 - (sustainability.energyConsumptionKwh / 1000) * 10, 40);
        const wasteScore = Math.min(100 - (sustainability.wasteGeneratedKg / 100) * 20, 20);
        ecoScore = Math.round(recyclingScore + energyScore + wasteScore);
      }

      // Asumimos 100 habitaciones por hotel como ejemplo
      const TOTAL_ROOMS = 100;
      const occupancyRate = occupancy ? occupancy.occupancyRate : 0; // Ya viene como porcentaje
      const availableRooms = Math.round(TOTAL_ROOMS * (100 - occupancyRate) / 100);

      return {
        ...hotel,
        calculatedData: {
          ecoScore,
          pricePerNight: occupancy ? occupancy.averagePricePerNight / 100 : 0,
          availableRooms,
          totalRooms: TOTAL_ROOMS,
          occupancyRate: occupancyRate
        },
        sustainabilityData: hotel.sustainabilityData.map(data => ({
          ...data,
          recyclingPercentage: data.recyclingPercentage / 100,
          energyConsumptionKwh: data.energyConsumptionKwh,
          wasteGeneratedKg: data.wasteGeneratedKg,
        }))
      };
    });

    // Ordenar los hoteles según los criterios aplicados
    const sortedHotels = [...formattedHotels].sort((a, b) => {
      if (minEcoScore !== undefined) {
        // Si hay filtro de eco score, ordenar de menor a mayor
        return a.calculatedData.ecoScore - b.calculatedData.ecoScore;
      } else {
        // Si no hay filtro de eco score, ordenar por precio de menor a mayor
        return a.calculatedData.pricePerNight - b.calculatedData.pricePerNight;
      }
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