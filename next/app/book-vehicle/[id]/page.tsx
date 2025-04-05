'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StarRating } from '../../book-service/components/StarRating';

interface Vehicle {
  id: number;
  name: string;
  stats: {
    averageTravelTime: number;
    averageUserCount: number;
    ecoScore: number;
    baseEcoScore: number;
  };
  popularRoutes: Array<{
    name: string;
    tripCount: number;
    averageUsers: number;
    averageTravelTime: number;
  }>;
  reviews: Array<{
    id: number;
    date: string;
    rating: number;
    comment: string | null;
    language: string | null;
  }>;
  usageTrends: Array<{
    date: string;
    userCount: number;
    averageTravelTimeMin: number;
  }>;
}

export default function VehicleDetails() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    async function fetchVehicleDetails() {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch vehicle details');
        const data = await res.json();
        
        // Calculate average rating
        if (data.reviews && data.reviews.length > 0) {
          const totalRating = data.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
          setAverageRating(totalRating / data.reviews.length);
        }
        
        setVehicle(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load vehicle details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchVehicleDetails();
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

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Vehicle not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">{vehicle.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Información del vehículo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Information</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Eco Score</span>
                    <div className="text-xs text-gray-500">Base score: {vehicle.stats.baseEcoScore}%</div>
                  </div>
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
            </div>
          </div>

          {/* Popular Routes Section */}
          {vehicle.popularRoutes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Routes</h2>
              <div className="space-y-4">
                {vehicle.popularRoutes.map((route, index) => (
                  <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{route.name}</span>
                      <span className="text-sm text-gray-600">
                        {route.tripCount} trips
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Average Users:</span>
                        <span>{route.averageUsers}/trip</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Time:</span>
                        <span>{route.averageTravelTime} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {vehicle.reviews && vehicle.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Reviews</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <StarRating rating={averageRating} />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({vehicle.reviews.length} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {vehicle.reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-gray-600">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                    {review.language && (
                      <span className="text-sm text-gray-500 mt-2 block">
                        Language: {review.language}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Your Trip</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min="1"
                  max="8"
                  defaultValue="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min="1"
                  max={vehicle.name.toLowerCase().includes('shared') ? 4 : 1}
                  defaultValue="1"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mt-4"
              >
                Book Now
              </button>
            </form>

            {/* Recent Usage Trends */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Usage Trends</h3>
              <div className="space-y-2">
                {vehicle.usageTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(trend.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-800">{trend.userCount} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}