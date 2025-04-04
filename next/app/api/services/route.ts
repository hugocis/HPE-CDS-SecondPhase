import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para determinar el tipo de servicio basado en el nombre
function determineServiceType(serviceName: string): string {
  const nameLower = serviceName.toLowerCase();
  
  if (nameLower.includes('atracción') || nameLower.includes('atraccion')) {
    return 'Atracción';
  }
  if (nameLower.includes('museo')) {
    return 'Museo';
  }
  if (nameLower.includes('parque')) {
    return 'Parque';
  }
  if (nameLower.includes('teatro')) {
    return 'Teatro';
  }
  if (nameLower.includes('restaurante')) {
    return 'Restaurante';
  }
  
  return 'Otros';
}

export async function GET(request: Request) {
  try {
    const services = await prisma.service.findMany({
      include: {
        reviews: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    const formattedServices = services.map(service => {
      const averageRating = service.reviews.length > 0
        ? service.reviews.reduce((acc, curr) => acc + curr.rating, 0) / service.reviews.length
        : 0;

      // Separar el nombre de la empresa de la actividad
      const parts = service.name.split(" ");
      const companyEndIndex = parts.findIndex(part => 
        part.includes("S.L.") || 
        part.includes("S.Com.") || 
        part.includes("S.L.N.E")
      );
      
      const activityName = parts.slice(companyEndIndex + 1).join(" ");
      const serviceType = determineServiceType(activityName);

      return {
        id: service.id,
        name: service.name,
        type: serviceType,
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews: service.reviews.length
        }
      };
    });

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}