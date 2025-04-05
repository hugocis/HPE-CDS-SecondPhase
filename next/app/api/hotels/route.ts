import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface SustainabilityData {
  id: number;
  hotelId: number;
  date: Date;
  energyConsumptionKwh: number;
  wasteGeneratedKg: number;
  recyclingPercentage: number;
  waterUsageM3: number;
}

interface OccupancyData {
  id: number;
  hotelId: number;
  date: Date;
  occupancyRate: number;
  confirmedBookings: number;
  cancellations: number;
  averagePricePerNight: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minEcoScore = searchParams.get('minEcoScore') ? parseFloat(searchParams.get('minEcoScore')!) : undefined;

    const hotels = await prisma.hotel.findMany({
      include: {
        sustainabilityData: {
          orderBy: {
            date: 'desc'
          },
          take: 1
        },
        occupancyData: {
          orderBy: {
            date: 'desc'
          },
          take: 1
        },
        reviews: {
          orderBy: {
            date: 'desc'
          },
          take: 2
        }
      }
    });

    const formattedHotels = hotels.map(hotel => {
      const latestAvailability = hotel.occupancyData[0];

      // Calculate eco score based on sustainability metrics
      let ecoScore = 0;
      if (hotel.sustainabilityData.length > 0) {
        const sustainability = hotel.sustainabilityData[0];
        // Lower energy and waste is better, higher recycling is better
        const energyScore = Math.max(0, 100 - (sustainability.energyConsumptionKwh / 10));
        const wasteScore = Math.max(0, 100 - (sustainability.wasteGeneratedKg / 5));
        const recyclingScore = sustainability.recyclingPercentage / 10; // Dividir entre 10 para normalizar el porcentaje
        ecoScore = Math.round((energyScore + wasteScore + recyclingScore) / 3);
      }

      const TOTAL_ROOMS = 100;
      const occupancyRate = latestAvailability ? latestAvailability.occupancyRate : 0;
      const availableRooms = Math.round(TOTAL_ROOMS * (100 - occupancyRate) / 100);

      return {
        id: hotel.id,
        name: hotel.name,
        calculatedData: {
          pricePerNight: (latestAvailability?.averagePricePerNight || 0) / 100,
          availableRooms,
          totalRooms: TOTAL_ROOMS,
          occupancyRate,
          ecoScore
        },
        sustainabilityData: hotel.sustainabilityData.map(data => ({
          ...data,
          recyclingPercentage: data.recyclingPercentage / 10 // Dividir entre 10 para normalizar el porcentaje
        })),
        reviews: hotel.reviews
      };
    });

    // Apply filters
    let filteredHotels = formattedHotels;
    
    if (minPrice !== undefined) {
      filteredHotels = filteredHotels.filter(hotel => hotel.calculatedData.pricePerNight >= minPrice);
    }
    
    if (maxPrice !== undefined) {
      filteredHotels = filteredHotels.filter(hotel => hotel.calculatedData.pricePerNight <= maxPrice);
    }
    
    if (minEcoScore !== undefined) {
      filteredHotels = filteredHotels.filter(hotel => hotel.calculatedData.ecoScore >= minEcoScore);
    }

    // Sort by eco score
    const sortedHotels = [...filteredHotels].sort((a, b) => 
      b.calculatedData.ecoScore - a.calculatedData.ecoScore
    );

    return NextResponse.json(sortedHotels);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to load hotels' }, { status: 500 });
  }
}