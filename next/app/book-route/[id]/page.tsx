'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StarRating } from '../../book-service/components/StarRating';

interface Route {
  id: number;
  name: string;
  type: string;
  details: {
    lengthKm: number | null;
    durationHr: number | null;
    popularity: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    recentUsage: number;
  };
  transportUsage: Array<{
    vehicleType: string;
    usageCount: number;
    averageUsers: number;
    averageTravelTime: number;
  }>;
  reviews: Array<{
    id: number;
    date: string;
    rating: number;
    comment: string | null;
    language: string | null;
  }>;
}

export default function RouteDetails() {
  const params = useParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRouteDetails() {
      try {
        const res = await fetch(`/api/routes/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch route details');
        const data = await res.json();
        setRoute(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load route details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchRouteDetails();
    }
  }, [params.id]);

  const formatDuration = (hours: number | null) => {
    if (!hours) return 'Duration not specified';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours > 0 
      ? `${wholeHours}h ${minutes > 0 ? `${minutes}m` : ''}`
      : `${minutes}m`;
  };

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

  if (!route) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Route not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-700">{route.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {route.type}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Popularity</div>
            <div className="text-2xl font-semibold text-green-600">
              {route.details.popularity}%
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Route Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Distance</span>
                <span className="font-semibold">{route.details.lengthKm} km</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Duration</span>
                <span className="font-semibold">{formatDuration(route.details.durationHr)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Recent Visitors</span>
                <span className="font-semibold">{route.stats.recentUsage}</span>
              </div>
              <div className="pt-4">
                <StarRating rating={route.stats.averageRating} />
                <p className="text-sm text-gray-600 mt-1">
                  {route.stats.totalReviews} {route.stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Transport Usage Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transport Options</h2>
            <div className="space-y-4">
              {route.transportUsage.map((transport, index) => (
                <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">{transport.vehicleType}</span>
                    <span className="text-sm text-gray-600">
                      {transport.usageCount} trips
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Average Users:</span>
                      <span>{transport.averageUsers}/trip</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Time:</span>
                      <span>{transport.averageTravelTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {route.reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Reviews</h2>
            <div className="space-y-6">
              {route.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                  {review.language && (
                    <span className="text-sm text-gray-500 mt-2 block">
                      Language: {review.language}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        <div className="mt-8">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
            Book This Route
          </button>
        </div>
      </div>
    </div>
  );
}