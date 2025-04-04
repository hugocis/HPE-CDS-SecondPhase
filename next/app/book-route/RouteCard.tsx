'use client';

import Link from 'next/link';
import { StarRating } from '../book-service/components/StarRating';

interface RouteCardProps {
  route: {
    id: number;
    name: string;
    type: string;
    routeClass: 'simple' | 'composite';
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
  };
}

export function RouteCard({ route }: RouteCardProps) {
  const formatDuration = (hours: number | null) => {
    if (!hours) return 'Duration not specified';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours > 0 
      ? `${wholeHours}h ${minutes > 0 ? `${minutes}m` : ''}`
      : `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{route.name}</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {route.type}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div className="flex space-x-4">
              {route.details.lengthKm && (
                <span>📍 {route.details.lengthKm} km</span>
              )}
              {route.details.durationHr && (
                <span>⏱️ {formatDuration(route.details.durationHr)}</span>
              )}
            </div>
            <span className="flex items-center mt-2">
              👥 {route.stats.recentUsage} recent visits
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <StarRating rating={route.stats.averageRating} />
              <p className="text-sm text-gray-600 mt-1">
                {route.stats.totalReviews} {route.stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Popularity</div>
              <div className="text-lg font-semibold text-green-600">
                {route.details.popularity}%
              </div>
            </div>
          </div>

          <Link href={`/book-route/${route.id}`}>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              View Route
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}