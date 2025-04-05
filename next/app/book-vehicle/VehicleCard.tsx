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
      baseEcoScore: number;
    };
  };
}

const vehicleIcons: { [key: string]: string } = {
  'Tranvía': '🚊',
  'Bicicleta': '🚲',
  'Autobús': '🚌',
  'Metro': '🚇',
  'Taxi': '🚕',
  'Coche Compartido': '🚗'
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getEcoScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{vehicleIcons[vehicle.name] || '🚗'}</span>
          <h3 className="text-xl font-semibold text-gray-800">{vehicle.name}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Eco Score</span>
                <div className="text-xs text-gray-500">Base: {vehicle.stats.baseEcoScore}%</div>
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                getEcoScoreColor(vehicle.stats.ecoScore)
              } text-white`}>
                {vehicle.stats.ecoScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${getEcoScoreColor(vehicle.stats.ecoScore)} rounded-full h-2`}
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
            <button className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>Book Now</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}