'use client';

import { useRouter } from 'next/navigation';

type HotelCardProps = {
  hotel: any;  // You can replace 'any' with a proper type if needed
};

export function HotelCard({ hotel }: HotelCardProps) {
  const router = useRouter();
  const sustainability = hotel.sustainabilityData[0];
  const occupancyRate = Math.round(((hotel.calculatedData.totalRooms - hotel.calculatedData.availableRooms) / hotel.calculatedData.totalRooms) * 100);
  
  const getOccupancyColor = (rate: number) => {
    if (rate < 60) return 'text-green-600 bg-green-100';
    if (rate < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{hotel.name}</h3>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm whitespace-nowrap">
            {hotel.calculatedData.ecoScore}% Eco Score
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-gray-600">
            <span className="font-semibold">Price:</span> €{hotel.calculatedData.pricePerNight.toFixed(2)}/night
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base text-gray-600">
              <span className="font-semibold">Occupancy:</span>
            </p>
            <span className={`px-2 py-1 rounded text-sm font-medium ${getOccupancyColor(occupancyRate)}`}>
              {occupancyRate}%
            </span>
          </div>
        </div>

        {sustainability && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Sustainability Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
              <p>Energy: {sustainability.energyConsumptionKwh} kWh</p>
              <p>Waste: {sustainability.wasteGeneratedKg} kg</p>
              <p>Recycling: {sustainability.recyclingPercentage.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {hotel.reviews && hotel.reviews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Latest Reviews</h4>
            <div className="space-y-2">
              {hotel.reviews.slice(0, 2).map((review: any) => (
                <div key={review.id} className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-500 italic line-clamp-2">&quot;{review.comment}&quot;</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => router.push(`/book-hotel/${hotel.id}`)}
          className="w-full mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}