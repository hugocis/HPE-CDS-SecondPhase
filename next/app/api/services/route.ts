import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to determine service type based on name
function determineServiceType(serviceName: string): string {
  const nameLower = serviceName.toLowerCase();
  
  if (nameLower.includes('atracción') || nameLower.includes('atraccion')) {
    return 'Attraction';
  }
  if (nameLower.includes('museo')) {
    return 'Museum';
  }
  if (nameLower.includes('parque')) {
    return 'Park';
  }
  if (nameLower.includes('teatro')) {
    return 'Theater';
  }
  if (nameLower.includes('restaurante')) {
    return 'Restaurant';
  }
  
  return 'Others';
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

      // Separate company name from activity
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