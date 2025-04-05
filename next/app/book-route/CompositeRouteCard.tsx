'use client';

import Link from 'next/link';

interface CompositeRouteCardProps {
  route: {
    id: number;
    name: string;
    origin: string;
    destination: string;
  };
}

export function CompositeRouteCard({ route }: CompositeRouteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Connection Route</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">From:</span>
                <span className="text-sm sm:text-base text-gray-800">{route.origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">To:</span>
                <span className="text-sm sm:text-base text-gray-800">{route.destination}</span>
              </div>
            </div>
          </div>

          <Link href={`/book-route/${route.id}`}>
            <button className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors">
              View Connection Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}