'use client';

import Link from 'next/link';
import { StarRating } from './components/StarRating';

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    type: string;
    stats: {
      averageRating: number;
      totalReviews: number;
    };
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{service.type}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <StarRating rating={service.stats.averageRating} />
              <p className="text-sm text-gray-600 mt-1">
                {service.stats.totalReviews} {service.stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          <Link href={`/book-service/${service.id}`}>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              View details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}