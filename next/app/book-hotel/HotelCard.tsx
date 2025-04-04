'use client';

type HotelCardProps = {
  hotel: any;  // You can replace 'any' with a proper type if needed
};

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{hotel.name}</h3>
          {hotel.sustainabilityData[0] && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {Math.round(hotel.sustainabilityData[0].recyclingPercentage)}% Eco Score
            </div>
          )}
        </div>
        
        {hotel.occupancyData[0] && (
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">Price:</span> ${hotel.occupancyData[0].averagePricePerNight}/night
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Availability:</span>{' '}
              {100 - Math.round(hotel.occupancyData[0].occupancyRate * 100)}% rooms available
            </p>
          </div>
        )}

        {hotel.sustainabilityData[0] && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Sustainability Metrics</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Water Usage: {hotel.sustainabilityData[0].waterUsageM3}m³</p>
              <p>Recycling Rate: {hotel.sustainabilityData[0].recyclingPercentage}%</p>
            </div>
          </div>
        )}

        {hotel.reviews && hotel.reviews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Latest Reviews</h4>
            <div className="space-y-2">
              {hotel.reviews.map((review: any) => (
                <div key={review.id} className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-500 italic">&quot;{review.comment}&quot;</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => alert('Booking functionality coming soon!')}
          className="w-full mt-6 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}