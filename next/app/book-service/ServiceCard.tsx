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
  // Separar el nombre del servicio en nombre de empresa y actividad
  const parts = service.name.split(" ");
  const companyEndIndex = parts.findIndex(part => part.includes("S.L.") || part.includes("S.Com."));
  const companyName = parts.slice(0, companyEndIndex + 1).join(" ");
  const activityName = parts.slice(companyEndIndex + 1).join(" ");

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{companyName}</h3>
                {activityName && (
                  <p className="text-sm sm:text-base text-gray-600">{activityName}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full whitespace-nowrap self-start sm:self-center">
                {service.type}
              </span>
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <StarRating rating={service.stats.averageRating} />
              <span className="text-sm text-gray-600">
                ({service.stats.totalReviews} {service.stats.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          <Link href={`/book-service/${service.id}`} className="block mt-4">
            <button className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}