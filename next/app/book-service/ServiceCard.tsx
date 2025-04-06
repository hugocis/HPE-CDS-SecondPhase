'use client';

import Link from 'next/link';
import { StarRating } from './components/StarRating';

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    type: string;
    price?: number;
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

  // Calcular el ecoScore potencial
  const calculateEcoScore = () => {
    const baseScore = service.stats?.averageRating ? Math.min(Math.round(service.stats.averageRating * 20), 80) : 60;
    const isNatureRelated = (service.type?.toLowerCase().includes('nature') || 
                           service.name?.toLowerCase().includes('nature') ||
                           service.type?.toLowerCase().includes('eco') ||
                           service.name?.toLowerCase().includes('eco') ||
                           service.type?.toLowerCase().includes('green') ||
                           service.name?.toLowerCase().includes('green'));
    return isNatureRelated ? Math.min(baseScore + 20, 100) : baseScore;
  };

  const ecoScore = calculateEcoScore();
  const potentialTokens = service.price ? Math.floor(ecoScore * service.price / 100) : 0;

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

          <div className="flex-grow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <StarRating rating={service.stats.averageRating} />
              <span className="text-sm text-gray-600">
                ({service.stats.totalReviews} {service.stats.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Eco-score y tokens indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${ecoScore}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">Eco-score</span>
                  <span className="text-xs font-medium text-green-600">{ecoScore}%</span>
                </div>
              </div>
              {potentialTokens > 0 && (
                <div className="text-green-600 text-sm font-medium whitespace-nowrap">
                  +{potentialTokens} 🌱
                </div>
              )}
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