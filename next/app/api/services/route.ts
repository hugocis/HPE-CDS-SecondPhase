import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

      return {
        id: service.id,
        name: service.name,
        type: service.type,
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews: service.reviews.length
        },
        reviews: service.reviews.map(review => ({
          id: review.id,
          date: review.date,
          rating: review.rating,
          comment: review.comment,
          language: review.language
        }))
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