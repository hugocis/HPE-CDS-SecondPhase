'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function HotelDetails() {
  const params = useParams();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotelDetails() {
      try {
        const res = await fetch(`/api/hotels/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch hotel details');
        const data = await res.json();
        setHotel(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchHotelDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Hotel not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">{hotel.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información principal */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hotel Information</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-semibold">Price:</span> €{hotel.calculatedData.pricePerNight.toFixed(2)}/night
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Available Rooms:</span> {hotel.calculatedData.availableRooms} of {hotel.calculatedData.totalRooms}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Occupancy Rate:</span> {hotel.calculatedData.occupancyRate}%
              </p>
            </div>
          </div>

          {/* Métricas de sostenibilidad */}
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Sustainability Metrics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Eco Score</span>
                <span className="font-semibold text-green-700">{hotel.calculatedData.ecoScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Energy Usage</span>
                <span className="font-semibold text-green-700">{hotel.sustainabilityData[0].energyConsumptionKwh} kWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waste Generated</span>
                <span className="font-semibold text-green-700">{hotel.sustainabilityData[0].wasteGeneratedKg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recycling Rate</span>
                <span className="font-semibold text-green-700">{(hotel.sustainabilityData[0].recyclingPercentage * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de reserva */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Your Stay</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min="1"
                max="4"
                defaultValue="2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mt-4"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>

      {/* Reseñas */}
      {hotel.reviews && hotel.reviews.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Guest Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.reviews.map((review: any) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                  <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 italic">&quot;{review.comment}&quot;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}