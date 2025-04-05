'use client';

import Link from 'next/link';

interface CompositeRouteCardProps {
  route: {
    id: number;
    name: string;
    origin: string;
    destination: string;
    details: {
      popularity: number;
    };
    stats: {
      recentUsage: number;
    };
  };
}

export function CompositeRouteCard({ route }: CompositeRouteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{route.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Connection Route
          </span>
        </div>

        <div className="space-y-6">
          {/* Progress line with stations */}
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-green-200"></div>
            <div className="space-y-6 relative">
              {/* Origin station */}
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">From</h4>
                  <p className="text-base text-gray-600">{route.origin}</p>
                </div>
              </div>

              {/* Destination station */}
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">To</h4>
                  <p className="text-base text-gray-600">{route.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Popularity</p>
              <p className="text-lg font-semibold text-green-600">{route.details.popularity}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Recent Users</p>
              <p className="text-lg font-semibold text-gray-800">{route.stats.recentUsage}</p>
            </div>
          </div>

          <Link href={`/book-route/${route.id}`}>
            <button className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}