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

const vehicleBasePrice: { [key: string]: number } = {
  'Tranvía': 25,
  'Bicicleta': 15,
  'Autobús': 20,
  'Metro': 22,
  'Taxi': 35,
  'Coche Compartido': 30
};

const vehicleIcons: { [key: string]: string } = {
  'Tranvía': '🚊',
  'Bicicleta': '🚲',
  'Autobús': '🚌',
  'Metro': '🚇',
  'Taxi': '🚕',
  'Coche Compartido': '🚗'
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getEcoScoreColors = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-600', text: 'text-green-600' };
    if (score >= 75) return { bg: 'bg-green-500', text: 'text-green-500' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-500' };
    return { bg: 'bg-orange-500', text: 'text-orange-500' };
  };

  const calculatePrice = (basePriceObj: { [key: string]: number }, vehicleName: string, ecoScore: number) => {
    const basePrice = basePriceObj[vehicleName] || 25;
    // Apply a small discount for high eco-score vehicles (up to 15% off)
    const discount = (ecoScore / 100) * 0.15;
    return (basePrice * (1 - discount)).toFixed(2);
  };

  const price = calculatePrice(vehicleBasePrice, vehicle.name, vehicle.stats.ecoScore);
  const colors = getEcoScoreColors(vehicle.stats.ecoScore);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{vehicleIcons[vehicle.name] || '🚗'}</span>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{vehicle.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Price</span>
            <p className="text-lg font-bold text-green-600">{price}€</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Eco Score</span>
                <div className="text-xs text-gray-500">Base: {vehicle.stats.baseEcoScore}%</div>
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${colors.bg} text-white`}>
                {vehicle.stats.ecoScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${colors.bg} rounded-full h-2`}
                style={{ width: `${vehicle.stats.ecoScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Avg. Travel Time</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">{vehicle.stats.averageTravelTime} min</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Daily Users</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">{vehicle.stats.averageUserCount}</p>
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