'use client';

import Link from 'next/link';

interface VehicleCardProps {
  vehicle: {
    id: number;
    name: string;
    stats: {
      averageTravelTime: number;
      averageUserCount: number;
      ecoScore: number;
    };
  };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{vehicle.name}</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Eco Score</span>
              <span className="text-sm font-semibold text-green-600">{vehicle.stats.ecoScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 rounded-full h-2" 
                style={{ width: `${vehicle.stats.ecoScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg. Travel Time</p>
              <p className="text-lg font-semibold text-gray-800">{vehicle.stats.averageTravelTime} min</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Daily Users</p>
              <p className="text-lg font-semibold text-gray-800">{vehicle.stats.averageUserCount}</p>
            </div>
          </div>

          <Link href={`/book-vehicle/${vehicle.id}`}>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Book {vehicle.name}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}