import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        reviews: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = service.reviews.length > 0
      ? service.reviews.reduce((acc, curr) => acc + curr.rating, 0) / service.reviews.length
      : 0;

    const formattedService = {
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

    return NextResponse.json(formattedService);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service details' },
      { status: 500 }
    );
  }
}