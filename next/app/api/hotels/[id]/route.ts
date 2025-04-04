import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: parseInt(params.id)
      },
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
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const sustainability = hotel.sustainabilityData[0];
    const occupancy = hotel.occupancyData[0];
    
    let ecoScore = 0;
    if (sustainability) {
      const recyclingScore = (sustainability.recyclingPercentage / 100) * 40;
      const energyScore = Math.min(100 - (sustainability.energyConsumptionKwh / 1000) * 10, 40);
      const wasteScore = Math.min(100 - (sustainability.wasteGeneratedKg / 100) * 20, 20);
      ecoScore = Math.round(recyclingScore + energyScore + wasteScore);
    }

    const TOTAL_ROOMS = 100;
    const occupancyRate = occupancy ? occupancy.occupancyRate : 0;
    const availableRooms = Math.round(TOTAL_ROOMS * (100 - occupancyRate) / 100);

    const formattedHotel = {
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

    return NextResponse.json(formattedHotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel details' },
      { status: 500 }
    );
  }
}