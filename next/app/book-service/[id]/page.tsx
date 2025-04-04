'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StarRating } from '../components/StarRating';

interface Service {
  id: number;
  name: string;
  type: string;
  stats: {
    averageRating: number;
    totalReviews: number;
  };
  reviews: Array<{
    id: number;
    date: string;
    rating: number;
    comment: string;
    language: string;
  }>;
}

export default function ServiceDetails() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServiceDetails() {
      try {
        const res = await fetch(`/api/services/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch service details');
        const data = await res.json();
        setService(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchServiceDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Service not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-2">{service.name}</h1>
        <p className="text-gray-600 mb-6">{service.type}</p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <StarRating rating={service.stats.averageRating} />
              <p className="text-sm text-gray-600 mt-1">
                {service.stats.totalReviews} {service.stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Reservar ahora
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
            <div className="space-y-6">
              {service.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <span className="text-sm text-gray-500 mt-2 block">
                    Language: {review.language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}