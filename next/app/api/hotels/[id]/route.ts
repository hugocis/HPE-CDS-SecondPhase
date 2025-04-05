import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const TOTAL_ROOMS = 100;

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
      // Normalizar el porcentaje de reciclaje a un máximo de 100%
      const normalizedRecycling = Math.min(sustainability.recyclingPercentage, 100);
      
      // Calcular puntuaciones individuales
      const recyclingScore = (normalizedRecycling / 100) * 40; // 40% del peso total
      
      // Calcular score de energía (menor consumo = mejor score)
      // Asumimos que 2000 kWh es el máximo razonable
      const normalizedEnergy = Math.max(0, Math.min(sustainability.energyConsumptionKwh, 2000));
      const energyScore = ((2000 - normalizedEnergy) / 2000) * 40; // 40% del peso total
      
      // Calcular score de residuos (menor cantidad = mejor score)
      // Asumimos que 2500 kg es el máximo razonable
      const normalizedWaste = Math.max(0, Math.min(sustainability.wasteGeneratedKg, 2500));
      const wasteScore = ((2500 - normalizedWaste) / 2500) * 20; // 20% del peso total
      
      // Sumar todos los scores y asegurar que está entre 0 y 100
      ecoScore = Math.max(0, Math.min(100, Math.round(recyclingScore + energyScore + wasteScore)));
    }

    const occupancyRate = occupancy ? occupancy.occupancyRate : 0;
    const availableRooms = Math.round(TOTAL_ROOMS * (100 - occupancyRate) / 100);

    const formattedHotel = {
      ...hotel,
      calculatedData: {
        ecoScore,
        pricePerNight: (occupancy ? occupancy.averagePricePerNight : 0) / 100,
        availableRooms,
        totalRooms: TOTAL_ROOMS,
        occupancyRate: occupancyRate
      },
      sustainabilityData: hotel.sustainabilityData.map(data => ({
        ...data,
        recyclingPercentage: Math.min(data.recyclingPercentage, 100), // Limitar a 100%
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